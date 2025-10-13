const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const APIKey = require('./APIKey');

const ApiUsageLog = sequelize.define('ApiUsageLog', {
  apiKeyId: { type: DataTypes.INTEGER, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  path: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  query: { type: DataTypes.TEXT },
  params: { type: DataTypes.TEXT },
  responseStatus: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

User.hasMany(ApiUsageLog, { foreignKey: 'userId' });
ApiUsageLog.belongsTo(User, { foreignKey: 'userId' });
APIKey.hasMany(ApiUsageLog, { foreignKey: 'apiKeyId' });
ApiUsageLog.belongsTo(APIKey, { foreignKey: 'apiKeyId' });

module.exports = ApiUsageLog;
