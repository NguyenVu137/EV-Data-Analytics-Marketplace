require('dotenv').config();
const bcrypt = require('bcryptjs');
// Use the project's configured sequelize so it respects DB_USE_SQLITE
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Dataset = require('../src/models/Dataset');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // Disable foreign key checks for sqlite to allow clean sync/drop
    try {
      await sequelize.query("PRAGMA foreign_keys = OFF;");
    } catch (e) {
      // ignore if not sqlite or not supported
    }
    await sequelize.sync({ force: true });
    console.log('Models synced (force: true)');
    try {
      await sequelize.query("PRAGMA foreign_keys = ON;");
    } catch (e) {
      // ignore
    }

    const providerPassword = await bcrypt.hash('provider123', 10);
    const provider = await User.create({
      name: 'Sample Provider',
      email: 'provider@example.com',
      password: providerPassword,
      role: 'provider'
    });

    const consumerPassword = await bcrypt.hash('consumer123', 10);
    await User.create({ name: 'Sample Consumer', email: 'consumer@example.com', password: consumerPassword, role: 'consumer' });

    const sampleDatasets = [];

    const regions = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Toàn quốc'];
    const vehicleTypes = ['EV Sedan', 'EV SUV', 'VF e34', 'VF 8', 'VF 9'];
    const batteryTypes = ['Li-ion', 'LFP', 'NMC'];
    const dataFormats = ['raw', 'analyzed', 'dashboard', 'api'];
    const categories = ['driving_behavior','battery_performance','charging_station','v2g_transaction'];

    let id = 1;
    for (let r of regions) {
      for (let vt of vehicleTypes) {
        for (let bt of batteryTypes) {
          for (let df of dataFormats) {
            const cat = categories[id % categories.length];
            sampleDatasets.push({
              title: `Dataset ${id} - ${cat} - ${r}`,
              description: `Mẫu dataset ${id} cho ${cat} khu vực ${r}, xe ${vt}, pin ${bt}, định dạng ${df}`,
              price: Math.round(100 + Math.random() * 900),
              dataCategory: cat,
              region: r,
              vehicleType: vt,
              batteryType: bt,
              dataFormat: df,
              timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
              usageRights: 'research_only',
              isAnonymized: true,
              status: 'approved',
              providerId: provider.id,
              locationLat: 21.0 + Math.random() * 10, // rough
              locationLng: 105.0 + Math.random() * 10,
              pricingType: ['per_download','subscription','api_access'][id % 3],
              pricingRaw: id % 2 === 0 ? Math.round(50 + Math.random() * 150) : null,
              pricingProcessed: id % 2 === 1 ? Math.round(80 + Math.random() * 200) : null,
              pricingSubscription: id % 5 === 0 ? Math.round(200 + Math.random() * 500) : null,
              pricingAPI: id % 4 === 0 ? Math.round(10 + Math.random() * 40) : null,
              sizeBytes: Math.round(100000 + Math.random() * 10000000),
              numRecords: Math.round(1000 + Math.random() * 100000),
              dataFields: JSON.stringify([{ name: 'timestamp', type: 'datetime' }, { name: 'SoC', type: 'int' }]),
            });
            id++;
            if (id > 60) { break; } // limit dataset count for speed
          }
            if (id > 60) { break; }
        }
          if (id > 60) { break; }
      }
  if (id > 60) { break; }
    }

    await Dataset.bulkCreate(sampleDatasets);
    console.log('Created sample datasets:', sampleDatasets.length);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
};

seed();
