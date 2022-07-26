const Sequelize = require("sequelize");
const {sequelize} = require("../database/connection");
const User = require("./User");

const Timelog = sequelize.define("timelog", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },

  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  timeElapsed: {
    type: Sequelize.STRING,
    allowNull: true,
  },
},{ timestamps: false });

User.hasMany(Timelog);
Timelog.belongsTo(User);

module.exports = Timelog;
