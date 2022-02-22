const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/quiz.controller");
const router = express.Router();


router

    .get("/all", [authJwt.verifyToken, authJwt.isActive], controller.getAllQuizzes)

    .get("/own", [authJwt.verifyToken, authJwt.isActive], controller.getOwnQuizzes)

    .get("/:id", [authJwt.verifyToken, authJwt.isActive], controller.getQuizById)

    .post("/new", [authJwt.verifyToken, authJwt.isActive], controller.createNewQuiz)

    .patch("/update/:id", [authJwt.verifyToken, authJwt.isActive], controller.updateQuiz)

    .delete("/delete/:id", [authJwt.verifyToken, authJwt.isActive], controller.deleteQuiz)

    .patch("/public/:id", [authJwt.verifyToken, authJwt.isActive], controller.setQuizPublic)

    .patch("/private/:id", [authJwt.verifyToken, authJwt.isActive], controller.setQuizPrivate)

    .post("/submit/:id", [authJwt.verifyToken, authJwt.isActive], controller.submitScore)

    .get("/scores/own", [authJwt.verifyToken, authJwt.isActive], controller.getOwnScores)

    .get("/scores/:id", [authJwt.verifyToken, authJwt.isActive], controller.getScores)

module.exports = router;