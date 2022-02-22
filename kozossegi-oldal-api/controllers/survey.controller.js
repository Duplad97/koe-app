const db = require("../models");
const User = db.User;
const Survey = db.Survey;
const SurvQuestion = db.SurvQuestion;
const UsrSurvAnswer = db.UsrSurvAnswer;
const PosSurvAnswer = db.PosSurvAnswer;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 * 
 * Az összes publikus kérdőív kérése.
 */
exports.getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.findAll({
            where: {
                public: true
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar', 'gender', 'school']
                },
                {
                    model: SurvQuestion,
                    as: 'questions'
                }
            ]
        });
        let result = [];
        for (let survey of surveys) {
            const questions = await survey.getQuestions();
            let resQuestions = [];
            for (let q of questions) {
                const answers = await q.getUsrAnswers();
                let qObj = {
                    q,
                    answers: answers
                }
                resQuestions.push(qObj);
            }
            let survObj = {
                survey,
                questions: resQuestions
            }
            result.push(survObj);
        }
        res.send(result);
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kérdőív adatainak kérése azonosító alapján.
 */
exports.getSurveyById = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await Survey.findOne({
            where: {
                id: id
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'school']
            }]
        });
        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        }
        else {
            // Leellenőrizzük, hogy a kérdőív publikus-e
            // vagy a sajátunk-e.
            let user = await survey.getUser();
            const own = user.id === req.userId;
            if ((user.id !== req.userId) && !survey.public) {
                res.status(400).send({ message: "Survey is not public!" })
            }
            let questions = await survey.getQuestions();
            let resQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                let answers = await questions[i].getPosAnswers();
                let usrAnswers = [];
                const allUsrAnswers = await questions[i].getUsrAnswers();
                // Ha a kérdőív a sajátunk, akkor az összes 
                // felhasználói választ megkapjuk
                if (user.id === req.userId) usrAnswers = allUsrAnswers;
                else {
                    for (let answer of allUsrAnswers) {
                        // Ellenkező esetben csak a sajátjainkat
                        if (answer.userId === req.userId) {
                            usrAnswers.push(answer);
                        }
                    }
                }
                let resQuestion = {
                    id: questions[i].id,
                    question: questions[i].question,
                    type: questions[i].type,
                    answers: answers,
                    usrAnswers: usrAnswers
                };
                resQuestions.push(resQuestion);
            }
            res.send({
                "survey": survey,
                "questions": resQuestions,
                "own": own
            });
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * A saját kérdőíveink és a hozzájuk tartozó válaszlehetőségek,
 * felhasználói válaszok kérése.
 */
exports.getUsrSurveys = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const surveys = await user.getSurveys();
            let result = [];
            for (let survey of surveys) {
                const questions = await survey.getQuestions();
                let resQuestions = [];
                for (let q of questions) {
                    const usrAnswers = await q.getUsrAnswers();
                    const posAnswers = await q.getPosAnswers();
                    let qObj = {
                        q,
                        answers: usrAnswers,
                        posAnswers: posAnswers
                    }
                    resQuestions.push(qObj);
                }
                let survObj = {
                    survey,
                    questions: resQuestions
                }
                result.push(survObj);
            }
            res.send(result);
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Új kérdőív létrehozása. 
 */
exports.saveNewSurvey = async (req, res) => {
    try {
        const body = req.body;
        if (!body) {
            res.status(400).send({ message: "No data!" });
        } else {
            const userId = req.userId;
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).send({ message: "User not found!" });
            } else {
                const foundSurvey = await Survey.findOne({
                    where: {
                        name: body.name
                    }
                });
                if (foundSurvey) {
                    res.status(400).send({message: "Name already in use!"});
                    return;
                }

                let survey = await Survey.create({
                    name: body.name,
                    category: body.category,
                    description: body.description
                });
                const questions = body.questions;
                questions.forEach(async (q) => {
                    let question = await SurvQuestion.create({
                        question: q.question,
                        type: q.type
                    });
                    const answers = q.answers;
                    answers.forEach(async (a) => {
                        let answer = await PosSurvAnswer.create({
                            answer: a
                        });
                        await question.addPosAnswer(answer);
                        await answer.setQuestion(question);
                    });
                    await survey.addQuestion(question);
                    await question.setSurvey(survey);
                });
                await user.addSurvey(survey);
                await survey.setUser(user);
                res.status(200).send({ message: "Survey created successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy meglévő kérdőív adatainak szerkesztése.
 */
exports.updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const survey = await Survey.findByPk(id);

        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        } else {
            if (!body) {
                res.status(400).send({ message: "Invalid data!" });
            } else {
                const foundSurvey = await Survey.findOne({
                    where: {
                        name: body.name
                    }
                });
                if (foundSurvey && foundSurvey !== survey) {
                    res.status(400).send({message: "Name already in use!"});
                    return;
                }

                let user = await survey.getUser();
                if (user.id !== req.userId) {
                    res.status(400).send({ message: "Can't update others survey!" });
                }

                if (survey.public) {
                    res.status(400).send({ message: "Can't update public survey!" });
                }

                /**
                 * A kérdőívhez tartozó kérdések, válaszlehetőségek, és
                 * felhasználói válaszok törlése, majd az új
                 * válaszlehetőségek hozzáadása. 
                 */
                let questions = await survey.getQuestions();
                for (let i = 0; i < questions.length; i++) {
                    let answers = await questions[i].getPosAnswers();
                    for (let i = 0; i < answers.length; i++) {
                        await PosSurvAnswer.destroy({
                            where: {
                                id: answers[i].id
                            }
                        });
                    }

                    let usrAnswers = await questions[i].getUsrAnswers();
                    for (let i = 0; i < usrAnswers.length; i++) {
                        await UsrSurvAnswer.destroy({
                            where: {
                                id: usrAnswers[i].id
                            }
                        });
                    }
                    await SurvQuestion.destroy({
                        where: {
                            id: questions[i].id
                        }
                    });
                }
                survey.name = body.name;
                survey.category = body.category;
                survey.description = body.description;
                await survey.save();
                questions = body.questions;
                questions.forEach(async (q) => {
                    let question = await SurvQuestion.create({
                        question: q.question,
                        type: q.type
                    });
                    const answers = q.answers;
                    answers.forEach(async (a) => {
                        let answer = await PosSurvAnswer.create({
                            answer: a
                        });
                        await question.addPosAnswer(answer);
                        await answer.setQuestion(question);
                    });
                    await survey.addQuestion(question);
                    await question.setSurvey(survey);
                });
                res.status(200).send({ message: "Survey updated successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kérdőív és a hozzá tartozó kérdések, válaszlehetőségek,
 * és felhasználói válaszok törlése.
 */
exports.deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await Survey.findByPk(id);
        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        } else {
            let user = await survey.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Can't delete others survey!" });
            }

            let questions = await survey.getQuestions();
            for (let i = 0; i < questions.length; i++) {
                let answers = await questions[i].getPosAnswers();
                for (let i = 0; i < answers.length; i++) {
                    await PosSurvAnswer.destroy({
                        where: {
                            id: answers[i].id
                        }
                    });
                }

                let usrAnswers = await questions[i].getUsrAnswers();
                for (let i = 0; i < usrAnswers.length; i++) {
                    await UsrSurvAnswer.destroy({
                        where: {
                            id: usrAnswers[i].id
                        }
                    });
                }
                await SurvQuestion.destroy({
                    where: {
                        id: questions[i].id
                    }
                });
            }
            await Survey.destroy({
                where: {
                    id: survey.id
                }
            });

            res.send({ message: "Survey deleted successfully!" });
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kérdőívhez felhasználói válasz hozzárendelése.
 */
exports.submitAnswer = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        const body = req.body;

        if (!body) {
            res.status(400).send("Invalid data!");
        }
        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const surveyId = body.surveyId;
            const survey = await Survey.findByPk(surveyId);
            if (!survey) {
                res.status(404).send({ message: "Survey not found!" })
            } else {
                const answers = body.answers;
                answers.forEach(async (answer) => {
                    const questionId = answer.questionId;
                    const question = await SurvQuestion.findByPk(questionId);

                    // Leellenőrizzük, hogy a kérésben szereplő kérdések léteznek-e,
                    // és valóban a kérdőívhez tartoznak-e.
                    if (!question) {
                        res.status(404).send({ message: `Question id:${questionId} not found!` });
                    }
                    let survQuestions = await survey.getQuestions({ joinTableAttributes: [] });
                    let includesQuestion = false;

                    survQuestions.forEach(q => {
                        if (q.id === question.id) {
                            includesQuestion = true;
                        }
                    });

                    if (!includesQuestion) {
                        res.status(400).send({ message: `Question id:${questionId} not part of survey!` });
                    }
                });
                answers.forEach(async (answer) => {
                    const questionId = answer.questionId;
                    const question = await SurvQuestion.findByPk(questionId);

                    let newAnswer = await UsrSurvAnswer.create({
                        answer: answer.answer
                    });

                    await user.addSurveyAnswer(newAnswer);
                    await newAnswer.setUser(user);
                    await question.addUsrAnswer(newAnswer);
                    await newAnswer.setQuestion(question);
                });

                res.send({ message: "Answers submitted successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kérdőív láthatóságának publikusra állítása.
 */
exports.setSurveyPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await Survey.findByPk(id);
        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        } else {
            let user = await survey.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Access denied!" });
            }
            if (survey.public) {
                res.status(400).send({ message: "Survey already public!" });
            } else {
                survey.public = true;
                await survey.save();
                res.send({ message: "Success!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Kérdőív láthatóságának privátra állítása.
 */
exports.setSurveyPrivate = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await Survey.findByPk(id);
        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        } else {
            let user = await survey.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Access denied!" });
            }
            if (!survey.public) {
                res.status(400).send({ message: "Survey already private!" });
            } else {
                survey.public = false;
                await survey.save();
                res.send({ message: "Success!" });
            }
        }
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy kérdőívhez tartozó saját válaszaink kérése. 
 */
exports.getSubmittedAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await Survey.findByPk(id);
        if (!survey) {
            res.status(404).send({ message: "Survey not found!" });
        } else {
            let questions = await survey.getQuestions();
            let resQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                let answers = await questions[i].getUsrAnswers();
                let resAnswers = [];
                for (let answer of answers) {
                    let user = await answer.getUser();
                    if (user.id === req.userId) {
                        resAnswers.push(answer);
                    }
                }
                let resQuestion = {
                    question: questions[i].question,
                    type: questions[i].type,
                    answers: resAnswers
                };
                resQuestions.push(resQuestion);
            }
            res.send({
                "survey": survey,
                "questions": resQuestions
            });
        }

    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
}