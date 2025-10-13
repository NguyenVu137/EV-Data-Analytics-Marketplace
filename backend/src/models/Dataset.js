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
  // Loại dataset: raw, processed
  type: {
    type: DataTypes.ENUM('raw', 'processed'),
    allowNull: false,
    defaultValue: 'raw'
  },
  // Pricing cho từng loại
  pricingRaw: { type: DataTypes.FLOAT }, // Giá mua lẻ bản raw
  pricingProcessed: { type: DataTypes.FLOAT }, // Giá mua lẻ bản processed
  pricingSubscription: { type: DataTypes.FLOAT }, // Giá thuê bao/tháng
  pricingAPI: { type: DataTypes.FLOAT }, // Giá API per 1000 requests hoặc per GB
  // Metadata bổ sung
  sizeBytes: { type: DataTypes.BIGINT },
  numRecords: { type: DataTypes.BIGINT },
  license: { type: DataTypes.STRING },
  provider: { type: DataTypes.STRING },
  sampleFile: { type: DataTypes.STRING }, // Đường dẫn file sample
  samplePreview: { type: DataTypes.JSON }, // 30-100 dòng sample preview
  dataFields: { type: DataTypes.JSON }, // Schema: [{name, type, description, unit}]
  lastUpdated: { type: DataTypes.DATE },
  updateFrequency: { type: DataTypes.STRING },
  // Trường cũ để tương thích
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
  // Location as lat/lng (sqlite doesn't support GEOMETRY reliably) - use numeric fields
  locationLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  locationLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
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
