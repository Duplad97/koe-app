'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Comment, {
        through: "Note_Comments",
        as: "comments"
      });
      this.belongsTo(models.User, {
        through: "User_Notes",
        as: "user",
        foreignKey: "userId"
      });
      this.belongsToMany(models.User, {
        through: "Note_Likes",
        as: "likers",
        foreignKey: "noteId"
      });
    }
  };
  Note.init({
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
    description: DataTypes.STRING,
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('path', value);
      }
    },
    visibility: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('visibility', value)
        }
    }
  }, {
    sequelize,
    modelName: 'Note',
  });
  return Note;
};