const db = require("../models");
const User = db.User;
const SecureCode = db.SecureCode;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const bcrypt = require("bcryptjs");
const mailsender = require("../middleware/mailsender");

const createSecureCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 25; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

/**
 * 
 * Felhasználó adatainak kérése azonosító alapján,
 * amennyiben az azonosító helyett "own" szerepel,
 * a saját profilunk lesz az eredmény.
 */
exports.getUserById = (req, res) => {
    let { id } = req.params;
    if (id === 'own') id = req.userId;
    User.findByPk(id)
        .then(async (user) => {
            if (!user) {
                res.sendStatus(404);
            } else {
                const own = id == req.userId;
                const our = await User.findByPk(req.userId);
                const active = our.status === "active";
                res.status(200).send({ user: user, own: own, active: active });
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        })
};

/**
 * 
 * Felhasználó barátainak kérése azonosító alapján,
 * amennyiben az azonosító helyett "own" szerepel,
 * a saját barátaink listája lesz az eredmény.
 */
exports.getFriends = async (req, res) => {
    try {
        let { id } = req.params;
        if (id === 'own') id = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).send({ message: 'User not found!' });
        } else {
            const friends = await user.getFriends({ joinTableAttributes: [] });
            res.send(friends);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Barát felkérés küldése.
 */
exports.sendRequest = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);
        const { requestedId } = req.body;

        if (id === requestedId) {
            res.status(400).send({ message: "Can't send request to yourself!" });
        } else {

            if (!user) {
                res.status(404).send({ message: 'User not found!' });
            } else {
                const requested = await User.findByPk(requestedId);

                if (!requested) {
                    res.status(404).send({ message: 'Requested user not found!' });
                } else {
                    // Megnézzük, hogy a felkérni kívánt felhasználó már a barátunk-e
                    const friends = await user.getFriends({ joinTableAttributes: [] });
                    let includesFriends = false;
                    friends.forEach(usr => {
                        if (usr.id === requested.id) {
                            includesFriends = true;
                        }
                    })
                    if (includesFriends) {
                        res.status(400).send({ message: "Requested user is already a friend!" });
                    } else {
                        // Megnézzük, hogy a felkérni kívánt felhasználóval van-e
                        // már függőben lévő barátfelkérésünk.
                        const sent = await user.getSentRequests({ joinTableAttributes: [] });
                        const inc = await user.getIncRequests({ joinTableAttributes: [] });

                        let includesSent = false;
                        let includesInc = false;
                        sent.forEach(usr => {
                            if (usr.id === requested.id) {
                                includesSent = true;
                            }
                        });
                        inc.forEach(usr => {
                            if (usr.id === requested.id) {
                                includesInc = true;
                            }
                        });

                        if (includesSent || includesInc) {
                            res.status(400).send({ message: "Friend request already pending!" })
                        } else {
                            await user.addSentRequest(requested);
                            await requested.addIncRequest(user);

                            res.send({ message: "Friend request sent!" });
                        }
                    }
                }
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Barát felkérés elfogadása.
 */
exports.acceptRequest = async (req, res) => {
    try {
        const id = req.userId;
        const { requesterId } = req.body;

        const user = await User.findByPk(id);
        const requester = await User.findByPk(requesterId);
        if (!user || !requester) {
            res.status(404).send({ message: "User not found!" });
        } else {
            if (id === requesterId) {
                res.status(400).send({ message: "Can't accept request from yourself!" });
            } else {
                // Megnézzük, hogy a cél felhasználó már a barátunk-e
                const friends = await user.getFriends();
                let includesFriends = false;
                friends.forEach(usr => {
                    if (usr.id === requester.id) {
                        includesFriends = true;
                    }
                })
                if (includesFriends) {
                    res.status(400).send({ message: "Already friends!" });
                } else {
                    // Megnézzük, hogy a cél felhasználóval ténylegesen van-e függőben 
                    // lévő elküldött felkérésünk
                    let inc = await user.getIncRequests(); // saját bejövő felkéréseink
                    let sent = await requester.getSentRequests(); // cél felhasználó által küldött felkérések
                    let includesInc = false;
                    let includesSent = false;
                    let incIndex = -1;
                    let sentIndex = -1;
                    // kaptunk-e felkérést a cél felhasználótól
                    inc.forEach((usr, i = 0) => {
                        if (usr.id === requester.id) {
                            includesInc = true;
                            incIndex = i;
                        }
                        i++;
                    });
                    // küldött-e a cél felhasználó felkérést nekünk
                    sent.forEach((usr, i = 0) => {
                        if (usr.id === user.id) {
                            includesSent = true;
                            sentIndex = i;
                        }
                        i++;
                    });

                    if (!includesInc || !includesSent) {
                        res.status(400).send({ message: "Request not pending!" });
                    } else {
                        // ha igen, akkor a függőben lévő kérések közül töröljük
                        // és most már a barátokhoz kerülnek
                        inc.splice(incIndex, 1);
                        sent.splice(sentIndex, 1);

                        await user.setIncRequests(inc);
                        await requester.setSentRequests(sent);
                        await user.addFriend(requester);
                        await requester.addFriend(user);

                        res.send({ message: "Friend request accepted!" });
                    }
                }
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Bejövő barátfelkérés elutasítása. 
 */
exports.declineRequest = async (req, res) => {
    try {
        const id = req.userId;
        const { requesterId } = req.body;

        const user = await User.findByPk(id);
        const requester = await User.findByPk(requesterId);
        if (!user || !requester) {
            res.status(404).send({ message: "User not found!" });
        } else {

            if (id === requesterId) {
                res.status(400).send({ message: "Can't decline request from yourself!" });
            } else {
                // Megnézzük, hogy a cél felhasználó a barátunk-e
                const friends = await user.getFriends();
                let includesFriends = false;
                friends.forEach(usr => {
                    if (usr.id === requester.id) {
                        includesFriends = true;
                    }
                })
                if (includesFriends) {
                    res.status(400).send({ message: "Already friends!" });
                } else {
                    // Megnézzük, hogy van-e függőben lévő felkérésünk
                    // a cél felhasználóval
                    let inc = await user.getIncRequests(); // saját bejövő felkéréseink
                    let sent = await requester.getSentRequests(); // cél felhasználó elküldött felkérései
                    let includesInc = false;
                    let includesSent = false;
                    let incIndex = -1;
                    let sentIndex = -1;
                    // a cél felhasználótól van-e bejövő
                    // felkérésünk
                    inc.forEach((usr, i = 0) => {
                        if (usr.id === requester.id) {
                            includesInc = true;
                            incIndex = i;
                        }
                        i++;
                    });
                    // a cél felhasználó küldött-e felkérést nekünk
                    sent.forEach((usr, i = 0) => {
                        if (usr.id === user.id) {
                            includesSent = true;
                            sentIndex = i;
                        }
                        i++;
                    });

                    if (!includesInc || !includesSent) {
                        res.status(400).send({ message: "Request not pending!" });
                    } else {
                        // ha igen, akkor a függőben lévő felkérések törlésre
                        // kerülnek (és értelemszerűen itt nincs barátkozás)
                        inc.splice(incIndex, 1);
                        sent.splice(sentIndex, 1);

                        await user.setIncRequests(inc);
                        await requester.setSentRequests(sent);

                        res.send({ message: "Friend request declined!" });
                    }
                }
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * Általunk küldött barát felkérés visszavonása.
 */
exports.cancelRequest = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);
        const { requestedId } = req.body;

        if (id === requestedId) {
            res.status(400).send({ message: "Can't cancel request to yourself!" });
        } else {

            if (!user) {
                res.status(404).send({ message: 'User not found!' });
            } else {
                const requested = await User.findByPk(requestedId);

                if (!requested) {
                    res.status(404).send({ message: 'Requested user not found!' });
                } else {
                    // Megnézzük, hogy a cél felhasználó a barátunk-e
                    const friends = await user.getFriends({ joinTableAttributes: [] });
                    let includesFriends = false;
                    friends.forEach(usr => {
                        if (usr.id === requested.id) {
                            includesFriends = true;
                        }
                    })
                    if (includesFriends) {
                        res.status(400).send({ message: "Requested user is already a friend!" });
                    } else {
                        // Megnézzük, hogy van-e függő felkérésünk a cél
                        // felhasználóval
                        let sent = await user.getSentRequests(); // általunk küldött felkérések
                        let inc = await requested.getIncRequests(); // cél felhasználó bejövő felkérései
                        let includesInc = false;
                        let includesSent = false;
                        let incIndex = -1;
                        let sentIndex = -1;
                        // a cél felhasználónak van-e bejövő
                        // felkérése tőlünk
                        inc.forEach((usr, i = 0) => {
                            if (usr.id === user.id) {
                                includesInc = true;
                                incIndex = i;
                            }
                            i++;
                        });
                        // van-e elküldött felkérésünk a cél felhasználónak
                        sent.forEach((usr, i = 0) => {
                            if (usr.id === requested.id) {
                                includesSent = true;
                                sentIndex = i;
                            }
                            i++;
                        });

                        if (!includesInc || !includesSent) {
                            res.status(400).send({ message: "Request not pending!" });
                        } else {
                            // ha igen, akkor a függőben lévő felkérések
                            // törlésre kerülnek
                            inc.splice(incIndex, 1);
                            sent.splice(sentIndex, 1);

                            await user.setSentRequests(sent);
                            await requested.setIncRequests(inc);

                            res.send({ message: "Friend request canceled!" });
                        }
                    }
                }
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Függőben lévő elküldött barát felkéréseink kérése.
 */
exports.getSentRequests = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const sentReqs = await user.getSentRequests({ joinTableAttributes: [] });
            res.send(sentReqs);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Függőben lévő bejövő barát felkéréseink kérése.
 */
exports.getIncomingRequests = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const incReqs = await user.getIncRequests({ joinTableAttributes: [] });
            res.send(incReqs);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Felhasználói profilunk szerkesztése, és aktiváló email küldése,
 * amennyiben email cím változtatás is történt.
 */
exports.updateProfile = async (req, res) => {
    try {
        const id = req.userId;
        const body = req.body;

        if (!body) {
            res.status(400).send({ message: "Invalid data!" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            // profil módosítás csak jelszó megadással lehetséges
            let passwordIsValid = bcrypt.compareSync(body.password, user.password);

            if (!passwordIsValid) {
                res.status(401).send({ message: "Invalid Password!" });
                return;
            }
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            if (body.newPassword !== "")
                user.password = bcrypt.hashSync(body.newPassword, 8);
            user.school = body.school;
            user.gender = body.gender;
            user.birth_date = body.birth_date;

            // ha a felhasználó email címet is változtat, akkor megnézzük,
            // hogy az foglalt-e már
            if (body.email !== user.email) {
                const userWithEmail = await User.findOne({
                    where: {
                        email: body.email
                    }
                });
                if (userWithEmail) {
                    res.status(400).send({ message: "Email already in use!" });
                } else {
                    // ha nem foglalt, akkor megváltoztatjuk az email címet, a profil státuszát
                    // "függőben lévőre" állítjuk, és kiküldünk egy új aktiváló
                    // emailt
                    user.status = 'pending';
                    user.email = body.email;
                    const code = await SecureCode.create({
                        code: createSecureCode()
                    });
                    await code.setUser(user);
                    mailsender.sendRegistrationMail(user.email, user.firstName, user.lastName, user.id, code.code);
                }
            }
            await user.save();
            res.send(user);
        }

    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Barát törlése.
 */
exports.deleteFriend = async (req, res) => {
    try {
        const id = req.userId;
        const { friendId } = req.body;

        const user = await User.findByPk(id);
        const friend = await User.findByPk(friendId);

        if (!user || !friend) {
            res.status(404).send({ message: "User not found!" });
        } else {
            // megnézzük, hogy mindkét fél barátlistájában
            // szerepel-e a másik
            let friends = await user.getFriends({ joinTableAttributes: [] });
            let includesFriends = false;
            let friendsIndex = -1;

            friends.forEach((usr, i = 0) => {
                if (usr.id === friend.id) {
                    includesFriends = true;
                    friendsIndex = i;
                }
                i++;
            });

            let fndFriends = await friend.getFriends({ joinTableAttributes: [] });
            let includesFndFriends = false;
            let fndFriendsIndex = -1;

            fndFriends.forEach((usr, i = 0) => {
                if (usr.id === friend.id) {
                    includesFndFriends = true;
                    fndFriendsIndex = i;
                }
                i++;
            });

            if (!includesFriends) {
                res.status(400).send({ message: "User is not a friend!" });
            } else {
                // ha igen, akkor mindkét fél barátlistájából
                // töröljük a másikat
                friends.splice(friendsIndex, 1);
                await user.setFriends(friends);

                fndFriends.splice(fndFriendsIndex, 1);
                await friend.setFriends(fndFriends);

                res.status(200).send({ message: "Friend deleted!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Olyan felhasználók listájának kérése, akikkel nincs
 * függőben lévő barát felkérésünk.
 */
exports.getExplorable = async (req, res) => {
    try {
        const id = req.userId = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.sendStatus(404);
        } else {
            const allUsers = await User.findAll({
                where: {
                    id: {
                        [Op.not]: id
                    }
                }
            });
            const friends = await user.getFriends();
            const incReqs = await user.getIncRequests();
            const sentReqs = await user.getSentRequests();
            let result = [];

            // leellenőrizzük, hogy az adott felhasználó szerepel-e
            // a barátlistában, az elküldött vagy bejövő felkéréseknél
            for (let i = 0; i < allUsers.length; i++) {
                let includes = false;

                for (let j = 0; j < friends.length; j++) {
                    if (allUsers[i].id === friends[j].id) {
                        includes = true;
                    }
                }


                for (let k = 0; k < incReqs.length; k++) {
                    if (allUsers[i].id === incReqs[k].id) {
                        includes = true;
                    }
                }


                for (let l = 0; l < sentReqs.length; l++) {
                    if (allUsers[i].id === sentReqs[l].id) {
                        includes = true;
                    }
                }

                if (!includes && allUsers[i].id !== user.id) {
                    result.push(allUsers[i]);
                }
            }

            res.send(result);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};

/**
 * 
 * Profilkép feltöltése a felhasználói profilhoz. 
 */
exports.uploadAvatar = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).send({ message: 'User not found!' });
        } else {
            let avatar;
            let uploadPath;

            // Ha nincs kép fájl megadva a kérésben, akkor a jelenlegi
            // profilkép törlésre kerül, amennyiben volt
            if (!req.files || Object.keys(req.files).length === 0) {
                if (user.avatar) {
                    fs.unlinkSync(`${process.cwd()}/uploads${user.avatar}`);
                    user.avatar = null;
                    await user.save();
                    res.sendStatus(200);
                } else {
                    res.status(400).send({ message: 'No files were uploaded.' });
                }
            } else {
                // ellenkező esetben a régi profilképet, ha volt
                // az újra cseréljük
                avatar = req.files.avatar;
                uploadPath = `${process.cwd()}/uploads/avatars/${user.id}/`;

                if (user.avatar) {
                    fs.unlinkSync(`${process.cwd()}/uploads${user.avatar}`);
                }

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath);
                }
                uploadPath += avatar.name;

                avatar.mv(uploadPath, async function (err) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        user.avatar = `/avatars/${user.id}/${avatar.name}`;
                        await user.save();
                        res.send({ message: 'File uploaded!' });
                    }
                });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message
        });
    }
};