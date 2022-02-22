const express = require('express');
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const authJwt = require('../middleware/authJwt');
const router = express.Router();

router

    .get("/", [authJwt.verifyToken], controller.authUser)

    .post("/register", [verifySignUp.checkDuplicateEmail], controller.signup)

    .post("/login", controller.signin)

    .post("/logout", controller.signout)
    
    .get("/confirm/:code/:id", controller.activateUser)

    .post("/confirm/resend", [authJwt.verifyToken], controller.resendEmail);

module.exports = router;