const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const DataCategory = sequelize.define("DataCategory", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM(
      'driving_behavior',    // hành vi lái xe
      'battery_performance', // hiệu suất pin
      'charging_station',    // sử dụng trạm sạc
      'v2g_transaction'      // giao dịch V2G
    ),
    allowNull: false
  }
});

module.exports = DataCategory;