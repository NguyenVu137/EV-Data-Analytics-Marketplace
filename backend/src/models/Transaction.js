const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // hoặc database.js tùy bạn
const User = require("./User");
const Dataset = require("./Dataset");

const Transaction = sequelize.define("Transaction", {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USD'
  },
  paymentIntentId: {
    type: DataTypes.STRING,
  },
  provider: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
});

// 1 Consumer có thể mua nhiều transaction
User.hasMany(Transaction, { foreignKey: "consumerId" });
Transaction.belongsTo(User, { foreignKey: "consumerId" });

// 1 Dataset có thể được mua nhiều lần
Dataset.hasMany(Transaction, { foreignKey: "datasetId" });
Transaction.belongsTo(Dataset, { foreignKey: "datasetId" });

module.exports = Transaction;
