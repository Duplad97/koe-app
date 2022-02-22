const db = require("../models");
const User = db.User;
const Chat = db.Chat;
const ChatMessage = db.ChatMessage;

/**
 * 
 * Az bejelentkezett felhasználó összes beszélgetésének kérése.
 */
exports.getAllMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const chats = await Chat.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: ChatMessage,
                    as: 'messages'
                }
            ]
        });
        let result = [];
        for (let chat of chats) {
            const friend = await User.findByPk(chat.friendId);
            let obj = {
                chat,
                friend: friend
            };
            result.push(obj);
        }
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}

/**
 * 
 * A bejelentkezett felhasználó olvasatlan beszlgetéseinek kérése.
 */
exports.getUnreadMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const chats = await Chat.findAll({
            where: {
                userId: userId,
                seen: false,
            },
            include: [
                {
                    model: ChatMessage,
                    as: 'messages'
                }
            ]
        });
        res.send(chats);
    } catch (error) {
        res.status(400).send({message: error.message});
    }
}