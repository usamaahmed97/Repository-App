const Pool = require("pg").Pool;
require("dotenv").config();
const Sequelize = require("sequelize");

if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
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

module.exports = { sequelize };
global.sequelize = sequelize;
