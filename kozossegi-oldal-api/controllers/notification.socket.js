'use strict'

const db = require("../models");
const User = db.User;
const Notification = db.Notification;

/**
 * Az értesítések socketjéhez tartozó események.
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('joinNotifications', async (params, cb) => {
            let user = await User.findByPk(parseInt(params.sender));
            // A beszélgetésekhez szükséges, hogy tudjuk jelezni,
            // ha egy felhasználó aktív lett.
            user.online = true;
            user.socketId = socket.id;
            await user.save();
            socket.join(params.sender);
            io.emit("user_connected", params.sender);
            cb();
        });

        socket.on('sendNotifications', async (request) => {
            await Notification.create({
                senderId: parseInt(request.sender),
                receiverId: parseInt(request.receiver),
                type: request.type
            })
            io.to(request.receiver).emit('receiveNotifications', request.message);
        });

        socket.on("sentMessage", request => {
            io.to(request.receiver).emit('incMessage', request);
        });

        socket.on("disconnect", async (request) => {
            // Szintén a beszélgetésekhez szükséges, hogy jelezni tudjuk,
            // ha egy felhasználó elhagyta az alkalmazást.
            let user = await User.findOne({
                where: {
                    socketId: socket.id
                }
            });
            if (user) {
                user.online = false;
                user.socketId = null;
                await user.save();
                io.emit("user_disconnected", user.id);
            }
        })
    })
};