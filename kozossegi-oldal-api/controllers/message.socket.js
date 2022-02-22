'use strict'

const db = require("../models");
const User = db.User;
const Chat = db.Chat;
const ChatMessage = db.ChatMessage;

/**
 * 
 * A csevegés socketjéhez tartozó események.
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('joinMessages', (params, cb) => {
            socket.join(params.sender);
            cb();
        });

        socket.on('sendMessage', async (request) => {
            await newMessage(request, io)
        });

        socket.on('readMessage', async (request) => {
            await readMessage(request, io)
        });
    });
};

/**
 * 
 *  Egy csevegés olvasottnak jelölése, majd erről értesítés küldése a cél felhasználó felé.
 */
const readMessage = async (request, io) => {
    let userChat = await Chat.findOne({
        where: {
            userId: request.sender,
            friendId: request.receiver
        }
    });

    let friendChat = await Chat.findOne({
        where: {
            userId: request.receiver,
            friendId: request.sender
        }
    });

    userChat.seen = true;
    friendChat.friendSeen = true;
    friendChat.seenAt = new Date();
    await userChat.save();
    await friendChat.save();

    await io.to(request.receiver).emit('messageRead', request);
}

/**
 * 
 * Üzenet küldése a cél felhasználónak.
 * Amennyiben még nem volt a két személy között beszélgetés,
 * egy új jön létre, ellenkező esetben a már meglévő
 * beszélgetéshez fűzödik hozzá az elküldeni kívánt üzenet.
 */
const newMessage = async (request, io) => {
    let userChat = await Chat.findOne({
        where: {
            userId: request.sender,
            friendId: request.receiver
        }
    });

    let friendChat = await Chat.findOne({
        where: {
            userId: request.receiver,
            friendId: request.sender
        }
    });

    if (!userChat && !friendChat) {
        userChat = await Chat.create({
            userId: request.sender,
            friendId: request.receiver,
            friendSeen: false,
            seen: true,
        });
        friendChat = await Chat.create({
            userId: request.receiver,
            friendId: request.sender,
            friendSeen: true,
            seen: false,
        });
    } else {
        userChat.friendSeen = false;
        userChat.seenAt = null;
        friendChat.seen = false;
        await userChat.save();
        await friendChat.save();
    }

    const message = await ChatMessage.create({
        senderId: request.sender,
        receiverId: request.receiver,
        message: request.message
    });

    await userChat.addMessage(message);
    await friendChat.addMessage(message);
    await message.addChats([userChat, friendChat]);

    await io.to(request.receiver).emit('receiveMessage', request);
    await io.to(request.sender).emit('messageReceived', {});
}