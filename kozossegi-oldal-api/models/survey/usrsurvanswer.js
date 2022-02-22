'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsrSurvAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SurvQuestion, {
        through: 'Surv_UsrAnswers',
        as: 'question',
        foreignKey: 'questionId'
      });
      this.belongsTo(models.User, {
        through: 'Usr_Answers',
        as: 'user'
      })
    }
  };
  UsrSurvAnswer.init({
    answer: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UsrSurvAnswer',
  });
  return UsrSurvAnswer;
};