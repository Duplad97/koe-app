const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/notification.controller");
const router = express.Router();

router

    .get("/unread", [authJwt.verifyToken], controller.getUnreadNotifications)

    //.get("/all", [authJwt.verifyToken], controller.getAllNotifications)

    .post("/read/:id", [authJwt.verifyToken], controller.readNotification)

    //.delete("/delete/:id", [authJwt.verifyToken], controller.deleteNotification)

    module.exports = router;