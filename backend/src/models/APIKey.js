const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const APIKey = sequelize.define("APIKey", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  quota: { type: DataTypes.INTEGER, defaultValue: 1000 }, // số request hoặc GB
  used: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'revoked', 'expired'), defaultValue: 'active' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expiredAt: { type: DataTypes.DATE },
});

User.hasMany(APIKey, { foreignKey: "userId" });
APIKey.belongsTo(User, { foreignKey: "userId" });

module.exports = APIKey;
