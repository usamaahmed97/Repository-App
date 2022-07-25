const Pool = require("pg").Pool;
require("dotenv").config();
const Sequelize = require("sequelize");

if (process.env.NODE_ENV === "production") {
  const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
  var pool = new Pool({
    connectionString: isProduction
      ? process.env.DATABASE_URL
      : connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  var sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: "localhost",
      dialect: "postgres",
      define: { timestamps: false, freezeTableName: true },
    }
  );
}

module.exports = { sequelize, pool };
global.sequelize = sequelize;
