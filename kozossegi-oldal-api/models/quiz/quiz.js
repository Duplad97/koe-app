'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        through: 'User_Quizzes',
        as: 'user',
        foreignKey: 'userId'
      });
      this.belongsToMany(models.QuizQuestion, {
        through: 'Quiz_Questions',
        as: 'questions',
      });
      this.belongsToMany(models.QuizScore, {
        through: 'Quiz_Scores',
        as: 'scores'
      });
    }
  };
  Quiz.init({
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
    }
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};