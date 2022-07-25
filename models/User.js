const Sequelize = require("sequelize");
const {sequelize} = require("../database/connection");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },

  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userType:{
    type: Sequelize.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: "user"
});

module.exports =User;
