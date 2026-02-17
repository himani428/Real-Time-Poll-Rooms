const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Poll = sequelize.define("Poll", {
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },

  options: {
    type: DataTypes.JSONB,
    allowNull: false
  },

  voters: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

module.exports = Poll;
