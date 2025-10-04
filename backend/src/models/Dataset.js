const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Dataset = sequelize.define("Dataset", {
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  pricingType: {
    type: DataTypes.ENUM('per_download', 'subscription', 'api_access'),
    allowNull: false,
    defaultValue: 'per_download'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  batteryType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dataFormat: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'raw'
  },
  timeRange: {
    type: DataTypes.JSON, // {start: "2023-01", end: "2023-12"}
    allowNull: true,
  },
  dataCategory: {
    type: DataTypes.ENUM(
      'driving_behavior',
      'battery_performance',
      'charging_station',
      'v2g_transaction'
    ),
    allowNull: false
  },
  usageRights: {
    type: DataTypes.ENUM('research_only', 'commercial', 'unrestricted'),
    allowNull: false,
    defaultValue: 'research_only'
  },
  isAnonymized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fileUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

// Một Provider (User role=provider) có thể có nhiều Dataset
User.hasMany(Dataset, { foreignKey: "providerId", as: 'Datasets' });
Dataset.belongsTo(User, { foreignKey: "providerId", as: 'Provider' });

module.exports = Dataset;
