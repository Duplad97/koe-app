'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurvQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Survey, {
        through: 'Survey_Questions',
        as: 'survey',
        foreignKey: 'surveyId'
      });
      this.belongsToMany(models.UsrSurvAnswer, {
        through: 'Surv_UsrAnswers',
        as: 'usrAnswers',
        foreignKey: 'questionId'
      });
      this.belongsToMany(models.PosSurvAnswer, {
        through: 'Surv_PosAnswers',
        as: 'posAnswers',
        foreignKey: 'questionId'
      })
    }
  };
  SurvQuestion.init({
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SurvQuestion',
  });
  return SurvQuestion;
};