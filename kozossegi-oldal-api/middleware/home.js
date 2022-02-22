const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require("../models");
const User = models.User;
const Note = models.Note;
const Survey = models.Survey;
const Quiz = models.Quiz;

/**
 * 
 * A barátaink által az elmúlt egy hétben feltöltött
 * jegyzetek, kérdőívek és kvízek kérése.
 */
exports.getHomeData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        const friends = await user.getFriends();
        const date = moment(new Date()).subtract(7, "days").toDate();
        let result = [];
        for (let friend of friends) {
            const notes = await Note.findAll({
                where: {
                    userId: friend.id,
                    createdAt: {
                        [Op.gte]: date
                    }
                }
            });
            for (let note of notes) {
                let obj = {
                    type: "note",
                    user: friend,
                    createdAt: note.createdAt,
                    note
                }
                result.push(obj);
            }

            const surveys = await Survey.findAll({
                where: {
                    userId: friend.id,
                    public: true,
                    createdAt: {
                        [Op.gte]: date
                    }
                }
            });
            for (let survey of surveys) {
                let obj = {
                    type: "survey",
                    user: friend,
                    createdAt: survey.createdAt,
                    survey
                }
                result.push(obj);
            }

            const quizzes = await Quiz.findAll({
                where: {
                    userId: friend.id,
                    public: true,
                    createdAt: {
                        [Op.gte]: date
                    }
                }
            });
            for (let quiz of quizzes) {
                let obj = {
                    type: "quiz",
                    user: friend,
                    createdAt: quiz.createdAt,
                    quiz
                }
                result.push(obj);
            }
        }
        await res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}