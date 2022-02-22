const db = require("../models");
const User = db.User;
const Quiz = db.Quiz;
const QuizQuestion = db.QuizQuestion;
const QuizScore = db.QuizScore;

/**
 * 
 * Az összes publikus kvíz kérése. 
 */
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({
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
                    model: QuizQuestion,
                    as: 'questions'
                }
            ]
        });
        res.send(quizzes);
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Az összes saját kvízünk kérése.
 */
exports.getOwnQuizzes = async (req, res) => {
    try {
        const userId = req.userId;
        const quizzes = await Quiz.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: QuizQuestion,
                    as: 'questions'
                }
            ]
        });
        res.send(quizzes);
    } catch (e) {
        res.status(400).send({
            message: e.message,
        });
    }
};

/**
 * 
 * Egy kvíz adatainak kérése azonosító alapján.
 */
exports.getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const quiz = await Quiz.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'school']
                },
                {
                    model: QuizQuestion,
                    as: 'questions'
                }
            ]
        });
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            // Meg kell nézni, hogy az adott kvíz vagy publikus-e
            // vagy a sajátunk-e.
            const user = await quiz.getUser();
            if (user.id !== userId && !quiz.public) {
                res.status(400).send({ message: "Access denied!" });
            } else {
                res.send(quiz);
            }
        }

    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Új kvíz létrehozása.
 */
exports.createNewQuiz = async (req, res) => {
    try {
        const userId = req.userId;
        const body = req.body;

        if (!body) {
            res.status(400).send({ message: "No data provided!" });
        } else {
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).send({ message: "User not found!" });
            } else {
                const foundQuiz = await Quiz.findOne({
                    where: {
                        name: body.name
                    }
                });
                if (foundQuiz) {
                    res.status(400).send({message: "Name already in use!"});
                    return;
                }

                const quiz = await Quiz.create({
                    name: body.name,
                    category: body.category
                });
                const questions = body.questions;
                questions.forEach(async (q) => {
                    const question = await QuizQuestion.create({
                        question: q.question,
                        ans1: q.ans1,
                        ans2: q.ans2,
                        ans3: q.ans3,
                        ans4: q.ans4,
                        correct: q.correct
                    });
                    await question.setQuiz(quiz);
                    await quiz.addQuestion(question);
                });
                await quiz.setUser(user);
                await user.addQuiz(quiz);

                res.send({ message: "Quiz created successfully!" });
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Egy meglévő kvíz adatainak szerkesztése.
 */
exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const body = req.body;
        let quiz = await Quiz.findByPk(id);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            if (!body) {
                res.status(400).send({ message: "No data provided" });
            } else {
                const user = await quiz.getUser();
                if (user.id !== userId) {
                    res.status(400).send({ message: "Access denied!" });
                } else {
                    const foundQuiz = await Quiz.findOne({
                        where: {
                            name: body.name
                        }
                    });
                    if (foundQuiz && foundQuiz !== quiz) {
                        res.status(400).send({message: "Name already in use!"});
                        return;
                    }

                    /**
                     * A kvízhez tartozó régi kérdések, és eredmények törlése,
                     * majd az új/szerkesztett kérdések hozzáadása.
                     */
                    let questions = await quiz.getQuestions();
                    for (let i = 0; i < questions.length; i++) {
                        await QuizQuestion.destroy({
                            where: {
                                id: questions[i].id
                            }
                        });
                    }
                    let scores = await quiz.getScores();
                    for (let i = 0; i < scores.length; i++) {
                        await QuizScore.destroy({
                            where: {
                                id: scores[i].id
                            }
                        });
                    }

                    quiz.name = body.name;
                    quiz.category = body.category;
                    await quiz.save();

                    questions = body.questions;
                    questions.forEach(async (q) => {
                        let question = await QuizQuestion.create({
                            question: q.question,
                            ans1: q.ans1,
                            ans2: q.ans2,
                            ans3: q.ans3,
                            ans4: q.ans4,
                            correct: q.correct
                        });
                        await question.setQuiz(quiz);
                        await quiz.addQuestion(question);
                    });
                    res.send({ message: "Quiz updated successfully!" });
                }
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Egy kvíz és a hozzá tartozó kérdések/eredmények
 * törlése azonosító alapján.
 */
exports.deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const body = req.body;
        const quiz = await Quiz.findByPk(id);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            if (!body) {
                res.status(400).send({ message: "No data provided" });
            } else {
                const user = await quiz.getUser();
                if (user.id !== userId) {
                    res.status(400).send({ message: "Access denied!" });
                } else {
                    const questions = await quiz.getQuestions();
                    for (let i = 0; i < questions.length; i++) {
                        await QuizQuestion.destroy({
                            where: {
                                id: questions[i].id
                            }
                        });
                    }
                    const scores = await quiz.getScores();
                    for (let i = 0; i < scores.length; i++) {
                        await QuizScore.destroy({
                            where: {
                                id: scores[i].id
                            }
                        });
                    }
                    await Quiz.destroy({
                        where: {
                            id: quiz.id
                        }
                    });
                    res.send({ message: "Quiz deleted successfully!" });
                }
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Kvíz láthatóságának publikusra állítása.
 */
exports.setQuizPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByPk(id);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            let user = await quiz.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Access denied!" });
            }
            if (quiz.public) {
                res.status(400).send({ message: "Quiz already public!" });
            } else {
                quiz.public = true;
                await quiz.save();
                res.send({ message: "Success!" });
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Kvíz láthatóságának privátra állítása.
 */
exports.setQuizPrivate = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByPk(id);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            let user = await quiz.getUser();
            if (user.id !== req.userId) {
                res.status(400).send({ message: "Access denied!" });
            }
            if (!quiz.public) {
                res.status(400).send({ message: "Quiz already private!" });
            } else {
                quiz.public = false;
                await quiz.save();
                res.send({ message: "Success!" });
            }
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Egy kvízhez egy felhasználó által elért eredmény
 * hozzáfűzése. 
 */
exports.submitScore = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const body = req.body;
        const quiz = await Quiz.findByPk(id);
        const user = await User.findByPk(userId);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        }
        if (!body) {
            res.status(400).send({ message: "No data provided" });
        }
        if (!user) {
            res.status(404).send({ message: "User not found!" });
        } else {
            const score = await QuizScore.create({
                full: body.full,
                correct: body.correct
            });
            await quiz.addScore(score);
            await user.addScore(score);
            await score.setQuiz(quiz);
            await score.setUser(user);

            res.send({ message: "Score submitted successfully!" });
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
};

/**
 * 
 * Egy kvízhez tartozó összes felhasználó által elért
 * eredmények kérése.
 */
exports.getScores = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByPk(id);
        if (!quiz) {
            res.status(404).send({ message: "Quiz not found!" });
        } else {
            const scores = await quiz.getScores();
            const result = [];
            for (let i = 0; i < scores.length; i++) {
                const user = await scores[i].getUser();
                const obj = {
                    full: scores[i].full,
                    correct: scores[i].correct,
                    date: scores[i].createdAt,
                    user: {
                        name: `${user.lastName} ${user.firstName}`,
                        avatar: user.avatar,
                        gender: user.gender,
                        shortName: user.lastName[0] + user.firstName[0],
                    }
                }
                result.push(obj);
            }
            res.send({quiz: quiz, scores: result});
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
}

/**
 * 
 * Az általunk összes kvíznél elért eredmény kérése.
 */
exports.getOwnScores = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (!user) { res.sendStatus(404) }
        else {
            const scores = await user.getScores();
            let result = [];
            for (let score of scores) {
                const quiz = await score.getQuiz();
                const obj = {
                    score: score,
                    quiz: quiz
                }
                result.push(obj);
            }
            res.send(result);
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
}