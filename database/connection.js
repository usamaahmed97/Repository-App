const Sequelize = require("sequelize");

if (process.env.NODE_ENV === "production") {
  //do something in production
} else {
  var sequelize = new Sequelize("repository-app", "postgres", "root", {
    host: "localhost",
    dialect: "postgres",
    define: { timestamps: false, freezeTableName: true },
  });
}

module.exports = sequelize;
global.sequelize = sequelize;
