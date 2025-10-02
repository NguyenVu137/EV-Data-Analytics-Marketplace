const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: true, // bật log SQL để debug
    dialectOptions: {
      connectTimeout: 60000
    },
    define: {
      timestamps: true,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;
