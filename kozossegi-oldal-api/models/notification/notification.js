'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Notification.init({
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      set(value) {
        this.setDataValue('seen', value);
      }
    },
    senderName: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('senderName', value);
      },
    },
    senderAvatar: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('senderAvatar', value);
      }
    },
    senderGender: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('senderGender', value);
      }
    },
    message: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('message', value);
      }
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};