'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PosSurvAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SurvQuestion, {
        through: 'Surv_PosAnswers',
        as: 'question',
        foreignKey: 'questionId'
      })
    }
  };
  PosSurvAnswer.init({
    answer: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PosSurvAnswer',
  });
  return PosSurvAnswer;
};