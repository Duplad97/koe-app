const db = require("../models");
const config = require("../config/auth.config");
const mailsender = require("../middleware/mailsender");
const User = db.User;
const BlackList = db.BlackList;
const SecureCode = db.SecureCode;

//const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * 
 * A profil aktiválásához szükséges kód generálása.
 */
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
 * Megnézzük, hogy a felhasználó be van-e jelentkezve.
 */
exports.authUser = async (req, res) => {
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
        res.status(404).send({message: "User not found!"});
    } else {
        res.send({message: "Authenticated!"});
    }
};

/**
 * 
 * Felhasználó létrehozása, és aktiváló email elküldése a megadott email címre.
 */
exports.signup = async (req, res) => {
    try {
        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            birth_date: req.body.birth_date,
            school: req.body.school,
            gender: req.body.gender
        })
        const code = await SecureCode.create({
            code: createSecureCode()
        });
        await code.setUser(user);
        mailsender.sendRegistrationMail(user.email, user.firstName, user.lastName, user.id, code.code);
        res.status(200).send({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/**
 * 
 * A felhasználó bejelentkeztetése, 24 óráig érvényes access token hozzárendelése.
 */
exports.signin = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then(user => {
            if (!user) {
                res.status(404).send({ message: "User Not found." });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            let token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            res.status(200).send({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accessToken: token
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

/**
 * 
 * A felhasználó kijelentkeztetése, a hozzá tartozó token feketelistához adása.
 */
exports.signout = (req, res) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        res.status(403).send({
            message: "No token provided!"
        });
    }

    BlackList.findOne({
        where: {
            token: token
        }
    }).then(invalidToken => {

        if (invalidToken) {
            res.status(403).send({
                message: "Invalid token!"
            });
        } else {
            BlackList.create({
                token: token
            }).then(() => {
                res.status(200).send({
                    message: "User logged out!"
                });
            }).catch(err => {
                res.status(500).send({ message: err.message });
            })
        }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
};

/**
 * 
 * Felhasználói profil aktiválása, ezáltal a hozzá tartozó aktiváló kód törlése az adatbázisból.
 */
exports.activateUser = async (req, res) => {
    try {
        const { code, id } = req.params;

        const secureCode = await SecureCode.findOne({
            where: {
                code: code
            }
        });
        if (!secureCode) {
            res.status(400).send({ message: "Missing code" });
        } else {
            const user = await secureCode.getUser();
            console.log('userId', user.id);
            if (!user) {
                res.status(404).send({ message: "User not found!" });
            } else if (user.id !== parseInt(id)) {
                res.status(400).send({ message: "Invalid code!" });
            } else {
                user.status = 'active';
                await user.save();
                await SecureCode.destroy({
                    where: {
                        id: secureCode.id
                    }
                });
                res.send({ message: "Email verified successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * A profil aktiválásához tartozó email újraküldése.
 */
exports.resendEmail = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            if (user.status === 'active') {
                res.status(400).send({ message: "Email already verified!" });
            } else {
                const code = await SecureCode.create({
                    code: createSecureCode()
                });
                code.setUser(user);
                mailsender.sendRegistrationMail(user.email, user.firstName, user.lastName, user.id, code.code);
                res.status(200).send({ message: 'Email sent successfully!' });
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};