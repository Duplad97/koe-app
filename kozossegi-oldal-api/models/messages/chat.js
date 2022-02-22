'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.ChatMessage, {
        as: 'messages',
        through: 'Chat_Messages'
      });
    }
  };
  Chat.init({
    userId: DataTypes.INTEGER,
    friendId: DataTypes.INTEGER,
    seen: {
      type: DataTypes.BOOLEAN,
      set(value) {
        this.setDataValue("seen", value);
      }
    },
    friendSeen: {
      type: DataTypes.BOOLEAN,
      set(value) {
        this.setDataValue("friendSeen", value);
      }
    },
    seenAt: {
      type: DataTypes.DATE,
      set(value) {
        this.setDataValue("seenAt", value);
      }
    }
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};