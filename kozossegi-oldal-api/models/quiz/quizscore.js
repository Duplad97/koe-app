'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuizScore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Quiz, {
        through: 'Quiz_Scores',
        as: 'quiz'
      });
      this.belongsTo(models.User, {
        through: 'User_Scores',
        as: 'user'
      });
    }
  };
  QuizScore.init({
    full: DataTypes.INTEGER,
    correct: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'QuizScore',
  });
  return QuizScore;
};