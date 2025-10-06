const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Subscription = sequelize.define("Subscription", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  tier: { type: DataTypes.ENUM('free', 'starter', 'business', 'enterprise'), allowNull: false },
  quotaDownloads: { type: DataTypes.INTEGER, defaultValue: 0 },
  quotaAPI: { type: DataTypes.INTEGER, defaultValue: 0 },
  usedDownloads: { type: DataTypes.INTEGER, defaultValue: 0 },
  usedAPI: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive', 'cancelled'), defaultValue: 'active' },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE },
  autoRenew: { type: DataTypes.BOOLEAN, defaultValue: true },
});

User.hasMany(Subscription, { foreignKey: "userId" });
Subscription.belongsTo(User, { foreignKey: "userId" });

module.exports = Subscription;
