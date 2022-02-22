const express = require('express');
const { authJwt } = require("../middleware");
const controller = require("../controllers/note.controller");
const router = express.Router();

router

    .get("/all", [authJwt.verifyToken], controller.getAllNotes)

    .get("/own", [authJwt.verifyToken], controller.getOwnNotes)

    .get("/:id", [authJwt.verifyToken], controller.getNoteById)

    .post ("/upload", [authJwt.verifyToken, authJwt.isActive], controller.uploadNote)

    .post("/update/:id", [authJwt.verifyToken, authJwt.isActive], controller.updateNote)

    .delete("/delete/:id", [authJwt.verifyToken, authJwt.isActive], controller.deleteNote)

    .post ("/comment/:id", [authJwt.verifyToken, authJwt.isActive], controller.commentOnNote)

    //.post("/comment/answer", [authJwt.verifyToken], controller.answerComment)

    .delete("/comment/delete/:id", [authJwt.verifyToken, authJwt.isActive], controller.deleteComment)

    .post("/like/:id", [authJwt.verifyToken, authJwt.isActive], controller.likeNote)

    .delete("/like/delete/:id", [authJwt.verifyToken, authJwt.isActive], controller.dislikeNote)

module.exports = router;