const Sequelize = require("sequelize");

const sequelize = new Sequelize("repository-app", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
  define: { timestamps: false, freezeTableName: true },
});

module.exports = sequelize;
global.sequelize = sequelize;
