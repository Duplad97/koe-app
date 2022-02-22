'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuizQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Quiz,{
        through: 'Quiz_Questions',
        as: 'quiz'
      });
    }
  };
  QuizQuestion.init({
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ans1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ans2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ans3: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ans4: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correct: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'QuizQuestion',
  });
  return QuizQuestion;
};