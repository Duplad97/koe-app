'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Note, {
        through: "Note_Comments",
        as: "note",
        foreignKey: "noteId"
      });
      this.belongsTo(models.User, {
        through: "User_Comments",
        as: "user",
        foreignKey: "userId"
      });
      this.belongsToMany(models.Comment, {
        through: "Comment_Answers",
        as: "answers",
        foreignKey: "answerId",
        otherKey: "commentId"
      });
    }
  };
  Comment.init({
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};