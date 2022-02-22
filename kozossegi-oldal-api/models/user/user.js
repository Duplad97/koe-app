'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.User, {
        through: 'User_Requests',
        as: 'incRequests',
        foreignKey: 'requestedId',
        onDelete: 'CASCADE'
      });
      this.belongsToMany(models.User, {
        through: 'User_Requests',
        as: 'sentRequests',
        foreignKey: 'requesterId',
        onDelete: 'CASCADE'
      });
      this.belongsToMany(models.User, {
        through: 'User_Friends',
        as: 'friends',
        foreignKey: 'userId',
        otherKey: 'friendId'
      });
      this.belongsToMany(models.Survey, {
        through: 'User_Surveys',
        as: 'surveys',
        otherKey: 'surveyId'
      });
      this.belongsToMany(models.UsrSurvAnswer, {
        through: 'Usr_Answers',
        as: 'surveyAnswers'
      })
      this.belongsToMany(models.Note, {
        through: 'User_Notes',
        as: 'notes',
      });
      this.belongsToMany(models.Note, {
        through: 'Note_Likes',
        as: 'likedNotes',
        foreignKey: 'userId'
      });
      this.belongsToMany(models.Comment, {
        through: 'User_Comments',
        as: 'comments'
      });
      this.hasOne(models.SecureCode, {
        as: 'secureCode',
      });
      this.belongsToMany(models.Quiz, {
        through: 'User_Quizzes',
        as: 'quizzes'
      });
      this.belongsToMany(models.QuizScore, {
        through: 'User_Scores',
        as: 'scores'
      })
    }
  };
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('firstName', value);
      }
     },
     lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('lastName', value);
      }
     },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('email', value);
      }
     },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('password', value);
      }
     },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
      set(value) {
        this.setDataValue('birth_date', value);
      }
     },
    school: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('school', value);
      }
     },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
     },
    avatar: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('avatar', value);
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('gender', value);
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      set(value) {
        this.setDataValue('status', value);
      }
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      set(value) {
        this.setDataValue('online', value);
      }
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue('socketId', value);
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};