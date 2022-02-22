const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/message.controller");
const router = express.Router();

router

    .get("/all", [authJwt.verifyToken, authJwt.isActive], controller.getAllMessages)

    .get("/unread", [authJwt.verifyToken, authJwt.isActive], controller.getUnreadMessages)

    module.exports = router;