const db = require("../models");
const User = db.User;
const Note = db.Note;
const Comment = db.Comment;
const fs = require('fs');

/**
 * 
 * Az összes, felhasználó által látható jegyzet kérése.
 */
exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'school', 'avatar', 'gender']
                }
            ]
        });
        const user = await User.findByPk(req.userId);
        const friends = await user.getFriends();
        let result = [];
        for (let i = 0; i < notes.length; i++) {
            //Ha a jegyzet láthatósága "barátok", akkor meg kell nézni, 
            //hogy a tulajdonosa a barátunk-e
            if (notes[i].visibility === 'friends') {
                let isFriend = false;
                friends.forEach(other => {
                    if (notes[i].user.id === other.id || notes[i].user.id === user.id) {
                        isFriend = true;
                    }
                });
                if (isFriend) {
                    const comments = await notes[i].getComments();
                    const likers = await notes[i].getLikers();
                    const obj = {
                        note: notes[i],
                        comments: comments,
                        likers: likers
                    }
                    result.push(obj);
                }
            } else {
                const comments = await notes[i].getComments();
                const likers = await notes[i].getLikers();
                const obj = {
                    note: notes[i],
                    comments: comments,
                    likers: likers
                }
                result.push(obj);
            }
        }
        const active = user.status === "active";
        res.send({ result: result, active: active });
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * A felhasználó saját jegyzeteinek kérése.
 */
exports.getOwnNotes = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            res.sendStatus(404);
        } else {
            const notes = await user.getNotes();
            let result = [];
            for (let i = 0; i < notes.length; i++) {
                const comments = await notes[i].getComments();
                const likers = await notes[i].getLikers();
                const obj = {
                    note: notes[i],
                    comments: comments,
                    likers: likers,
                    user: user,
                }
                result.push(obj);
            }
            res.send(result);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy jegyzet adatainak kérése azonosító alapján.
 */
exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(req.userId);
        const note = await Note.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'likers',
                    attributes: ['id']
                }
            ]
        });
        
        if (!note) {
            res.status(404).send({ message: "Note not found!" });
        } else {
            //Ha a jegyzet láthatósága "barátok", akkor meg kell nézni, 
            //hogy a tulajdonosa a barátunk-e
            if (note.visibility === 'friends') {
                const friends = await user.getFriends();
                let isFriend = false;
                friends.forEach(other => {
                    if (note.user.id === other.id || note.user.id === user.id) {
                        isFriend = true;
                    }
                });
                if (!isFriend) {
                    res.status(400).send({message: 'Access denied!'});
                }
            }
    
            let comments = await note.getComments();
            let result = [];
            for (let i = 0; i < comments.length; i++) {
                let user = await comments[i].getUser();
                let obj = {
                    comment: comments[i],
                    user: user
                }
                result.push(obj);
            }
            res.send({ note: note, comments: result });
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Új jegyzet feltöltése.
 */
exports.uploadNote = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const body = req.body;
            if (!body) {
                res.status(400).send({ message: "No data provided!" });
            } else {
                const foundNote = await Note.findOne({
                    where: {
                        name: body.name
                    }
                });
                if (foundNote) {
                    res.status(400).send({message: "Name already in use!"});
                    return;
                }

                let file;
                let uploadPath;

                if (!req.files || Object.keys(req.files).length === 0) {
                    res.status(400).send({ message: 'No files were uploaded.' });
                } else {
                    file = req.files.file;
                    uploadPath = `${process.cwd()}/uploads/notes/${user.id}/`;

                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath);
                    }
                    uploadPath += file.name;

                    file.mv(uploadPath, async function (err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            let note = await Note.create({
                                name: body.name,
                                public: body.public,
                                category: body.category,
                                description: body.description,
                                path: `/notes/${user.id}/${file.name}`,
                                visibility: body.visibility
                            });
                            await user.addNote(note);
                            await note.setUser(user);
                            res.send({ message: "Note created successfully!" });
                        }
                    });
                }
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy már meglévő jegyzet adatainak szerkesztése azonosító alapján.
 */
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByPk(id);
        const body = req.body;
        if (!note) {
            res.status(404).send({ message: "Note not found!" });
        }
        if (!body) {
            res.status(400).send({ message: "No data provided!" });
        } else {
            let user = await note.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Access denied!" })
            }
            const foundNote = await Note.findOne({
                where: {
                    name: body.name
                }
            });
            if (foundNote && foundNote !== note) {
                res.status(400).send({message: "Name already in use!"});
                return;
            }

            if (!req.files || Object.keys(req.files).length === 0) {
                await note.update({
                    name: body.name,
                    category: body.category,
                    description: body.description,
                    visibility: body.visibility
                });
                res.send({ message: "Note updated successfully!" });
            } else {
                let file;
                let uploadPath;

                if (fs.existsSync(`${process.cwd()}/uploads${note.path}`)) {
                    fs.unlinkSync(`${process.cwd()}/uploads${note.path}`);
                }

                file = req.files.file;
                uploadPath = `${process.cwd()}/uploads/notes/${user.id}/`;

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath);
                }
                uploadPath += file.name;

                file.mv(uploadPath, async function (err) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        await note.update({
                            name: body.name,
                            category: body.category,
                            description: body.description,
                            path: `/notes/${user.id}/${file.name}`,
                            visibility: body.visibility
                        });
                        res.send({ message: "Note updated successfully!" });
                    }
                });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy felhasználó törölheti egy saját jegyzetét, vagy egy admin
 * jogosultságú felhasználó bárkiét.
 */
exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByPk(id);
        if (!note) {
            res.status(404).send({ message: "Note not found!" });
        }
        let user = await note.getUser();
        const iAm = await User.findByPk(req.userId);
        if ((user.id !== iAm.id) && (iAm.role !== 'admin')) {
            res.status(400).send({ message: "Access denied!" })
        } else {
            fs.unlinkSync(`${process.cwd()}/uploads${note.path}`);

            let comments = await note.getComments();

            for (let i = 0; i < comments.length; i++) {
                await Comment.destroy({
                    where: {
                        id: comments[i].id
                    }
                });
            }
            await Note.destroy({
                where: {
                    id: id
                }
            });
            res.send({ message: "Note deleted successfully!" });
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Komment hozzáfűzése egy jegyzethez.
 */
exports.commentOnNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const note = await Note.findByPk(id);
        const user = await User.findByPk(userId);

        if (!user || !note) {
            res.sendStatus(404);
        } else {
            const body = req.body;
            if (!body) {
                res.sendStatus(400);
            }
            let comment = await Comment.create({
                text: body.text
            });

            await note.addComment(comment);
            await comment.setNote(note);
            await user.addComment(comment);
            await comment.setUser(user);

            res.sendStatus(200);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/*exports.answerComment = async (req, res) => {
    try {
        res.status(400).send({message: "Not implemented yet!"});
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};*/

/**
 * 
 * Egy általunk elküldött komment törlése.
 * Admin jogosultságú felhasználó törölheti bárki kommentjét. 
 * */
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByPk(id);

        if (!comment) {
            res.status(404).send({ message: "Comment not found!" });
        } else {
            let user = await comment.getUser();
            const iAm = await User.findByPk(req.userId);
            if ((user.id !== iAm.id) && (iAm.role !== 'admin')) {
                res.status(400).send({ message: "Access denied!" });
            } else {
                await Comment.destroy({
                    where: {
                        id: id
                    }
                });
                res.send({ message: "Comment deleted successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kedvelés hozzáadása egy jegyzethez. 
 */
exports.likeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const note = await Note.findByPk(id);
        const user = await User.findByPk(userId);
        if (!note || !user) {
            res.sendStatus(404);
        } else {
            let likers = await note.getLikers();;
            let likersContains = false;
            likers.forEach(l => {
                if (l.id === user.id) {
                    likersContains = true;
                }
            });

            if (likersContains) {
                res.status(400).send({ message: "Note already liked!" });
            } else {
                await note.addLiker(user);
                await user.addLikedNote(note);
                res.send({ message: "Note liked successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kedvelés törlése egy jegyzetről.
 */
exports.dislikeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const note = await Note.findByPk(id);
        const user = await User.findByPk(userId);
        if (!note || !user) {
            res.sendStatus(404);
        } else {
            let likers = await note.getLikers();;
            let likersContains = false;
            let likersIndex = 0;
            likers.forEach((l, i = 0) => {
                if (l.id === user.id) {
                    likersContains = true;
                    likersIndex = i;
                }
                i++;
            });

            let likedNotes = await user.getLikedNotes();
            let likedContains = false;
            let likedIndex = 0;
            likedNotes.forEach((l, i = 0) => {
                if (l.id === note.id) {
                    likedContains = true;
                    likedIndex = i;
                }
                i++;
            });

            console.log(likersContains);
            console.log(likedContains);

            if (!likersContains || !likedContains) {
                res.status(400).send({ message: "Note is not liked by user!" });
            } else {
                likers.splice(likersIndex, 1);
                await note.setLikers(likers);

                likedNotes.splice(likedIndex, 1)
                await user.setLikedNotes(likedNotes);
                res.send({ message: "Note disliked successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};