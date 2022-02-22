const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const router = express.Router();

router

    .get("/profile/:id", [authJwt.verifyToken], controller.getUserById)

    .post("/profile/update", [authJwt.verifyToken], controller.updateProfile)

    .get("/friends/:id", [authJwt.verifyToken, authJwt.isActive], controller.getFriends)

    .post("/friends/delete", [authJwt.verifyToken, authJwt.isActive], controller.deleteFriend)

    .get("/explore", [authJwt.verifyToken, authJwt.isActive], controller.getExplorable)

    .post("/profile/upload", [authJwt.verifyToken, authJwt.isActive], controller.uploadAvatar)

    /* Friend requests */
    .post("/request/send", [authJwt.verifyToken, authJwt.isActive], controller.sendRequest)

    .post("/request/cancel", [authJwt.verifyToken, authJwt.isActive], controller.cancelRequest)

    .post("/request/accept", [authJwt.verifyToken, authJwt.isActive], controller.acceptRequest)

    .post("/request/decline", [authJwt.verifyToken, authJwt.isActive], controller.declineRequest)

    .get("/request/sent", [authJwt.verifyToken, authJwt.isActive], controller.getSentRequests)

    .get("/request/incoming", [authJwt.verifyToken, authJwt.isActive], controller.getIncomingRequests)

module.exports = router;
