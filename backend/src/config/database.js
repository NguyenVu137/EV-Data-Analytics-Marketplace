const { Sequelize } = require("sequelize");
require("dotenv").config();
const path = require('path');

let sequelize;
const useSqliteEnv = (v) => {
  if (!v) return false;
  const s = String(v).toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes';
};

if (useSqliteEnv(process.env.DB_USE_SQLITE)) {
  const { Sequelize: Seq } = require('sequelize');
  const storagePath = path.resolve(__dirname, '../../sqlite-dev.db');
  sequelize = new Seq({
    dialect: 'sqlite',
    storage: storagePath,
    logging: console.log,
    define: { timestamps: true, freezeTableName: true }
  });
} else {
  sequelize = new Sequelize(
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
}

module.exports = sequelize;
