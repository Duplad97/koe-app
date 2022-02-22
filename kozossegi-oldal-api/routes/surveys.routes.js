const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/survey.controller");
const router = express.Router();


router

    .get("/all", [authJwt.verifyToken, authJwt.isActive], controller.getAllSurveys)

    .get("/own", [authJwt.verifyToken, authJwt.isActive], controller.getUsrSurveys)

    .get("/:id", [authJwt.verifyToken, authJwt.isActive], controller.getSurveyById)

    .post("/new", [authJwt.verifyToken, authJwt.isActive], controller.saveNewSurvey)

    .patch("/update/:id", [authJwt.verifyToken, authJwt.isActive], controller.updateSurvey)

    .delete("/delete/:id", [authJwt.verifyToken, authJwt.isActive], controller.deleteSurvey)

    .post("/submit", [authJwt.verifyToken, authJwt.isActive], controller.submitAnswer)

    .patch("/set/public/:id", [authJwt.verifyToken, authJwt.isActive], controller.setSurveyPublic)

    .patch("/set/private/:id", [authJwt.verifyToken, authJwt.isActive], controller.setSurveyPrivate)

    .get("/answers/:id", [authJwt.verifyToken, authJwt.isActive], controller.getSubmittedAnswers)

module.exports = router;