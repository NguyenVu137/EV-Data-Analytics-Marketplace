const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Transaction = require('./Transaction');
const User = require('./User');

const Invoice = sequelize.define('Invoice', {
  transactionId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'USD' },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  paidAt: { type: DataTypes.DATE },
  description: { type: DataTypes.STRING },
  lines: { type: DataTypes.TEXT },
  pdfPath: { type: DataTypes.STRING }
});

Transaction.hasOne(Invoice, { foreignKey: 'transactionId' });
Invoice.belongsTo(Transaction, { foreignKey: 'transactionId' });

User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

module.exports = Invoice;
