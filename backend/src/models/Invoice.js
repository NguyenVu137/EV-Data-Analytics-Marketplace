const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Invoice = sequelize.define("Invoice", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  pdfUrl: { type: DataTypes.STRING },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  paidAt: { type: DataTypes.DATE },
  description: { type: DataTypes.STRING },
});

User.hasMany(Invoice, { foreignKey: "userId" });
Invoice.belongsTo(User, { foreignKey: "userId" });

module.exports = Invoice;
