const db = require("../models");
const User = db.User;
const Notification = db.Notification;

/**
 * 
 * Olvasatlan értesítések kérése, illetve az értesítés
 * típusa alapján üzenet beállítása.
 */
exports.getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).send({message: "User not found!"});
        } else {
            let notifications = await Notification.findAll({
                where: {
                    receiverId: user.id,
                    seen: false
                }
            });

            for (let i = 0; i < notifications.length; i++) {
                const sender = await User.findByPk(notifications[i].senderId);
                notifications[i].senderName = `${sender.lastName} ${sender.firstName}`;
                notifications[i].senderGender = sender.gender;
                if (sender.avatar) {
                    notifications[i].senderAvatar = sender.avatar;
                }
                let message = "";
                switch(notifications[i].type) {
                    case "friendRequest":
                        message = "barát felkérést küldött!";
                        break;
                    case "requestAccept":
                        message = "elfogadta a felkérésedet!";
                        break;
                    case "requestDecline":
                        message = "elutasította a felkérésedet!";
                        break;
                }
                notifications[i].message = message;
                await notifications[i].save();
            }

            res.send(notifications);
        }
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};

/*
exports.getAllNotifications = async (req, res) => {
    try {
        //ToDo
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};
*/

/**
 * 
 * Értesítés olvasottnak jelölése.
 */
exports.readNotification = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.userId;
        const notification = await Notification.findByPk(id);
        if (!notification) {
            res.status(404).send({message: "Notification not found!"});
        } else {
            if (notification.receiverId !== parseInt(userId)) {
                res.status(400).send({message: "Access denied!"});
            } else {
                notification.seen = true;
                await notification.save();
                res.sendStatus(200);
            }
        }
    } catch (err) {
        res.status(400).send({message: err.message});
    }
};

/*
exports.deleteNotification = async (req, res) => {
    try {

    } catch (err) {
        res.status(400).send({message: err.message});
    }
};
*/