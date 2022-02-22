'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        through: 'User_Surveys',
        as: 'user',
        foreignKey: 'userId'
      });
      this.belongsToMany(models.SurvQuestion, {
        through: 'Survey_Questions',
        as: 'questions',
        foreignKey: 'surveyId'
      });
    }
  };
  Survey.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('name', value);
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('category', value);
      }
    },
    public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      set(value) {
        this.setDataValue('public', value);
      }
    },
    description: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('description', value);
      }
    }
  }, {
    sequelize,
    modelName: 'Survey',
  });
  return Survey;
};