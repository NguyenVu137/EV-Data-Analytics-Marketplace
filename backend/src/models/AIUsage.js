const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AIUsage = sequelize.define('AIUsage', {
  userId: { type: DataTypes.INTEGER },
  prompt: { type: DataTypes.TEXT },
  response: { type: DataTypes.TEXT },
  tokensUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

User.hasMany(AIUsage, { foreignKey: 'userId' });
AIUsage.belongsTo(User, { foreignKey: 'userId' });

module.exports = AIUsage;
