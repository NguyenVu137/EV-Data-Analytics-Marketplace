// Inspect DB used by backend Sequelize and report dataset counts
process.env.DB_USE_SQLITE = process.env.DB_USE_SQLITE || 'true';
const path = require('path');
const sequelize = require(path.resolve(__dirname, '../backend/src/config/database'));

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // Print sequelize options (to find storage path if sqlite)
    console.log('Sequelize options:', sequelize.options || sequelize.config || {});

    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", { type: sequelize.QueryTypes.SELECT });
    console.log('tables:', tables.map(t => t.name));

    // total datasets
    const total = await sequelize.query("SELECT COUNT(*) as c FROM Dataset", { type: sequelize.QueryTypes.SELECT });
    console.log('total datasets:', total && total[0] ? total[0].c : total);

    const approved = await sequelize.query("SELECT COUNT(*) as c FROM Dataset WHERE status='approved'", { type: sequelize.QueryTypes.SELECT });
    console.log('approved datasets:', approved && approved[0] ? approved[0].c : approved);

    const rows = await sequelize.query("SELECT id, title, status, createdAt FROM Dataset ORDER BY createdAt DESC LIMIT 10", { type: sequelize.QueryTypes.SELECT });
    console.log('sample rows:', rows);

    process.exit(0);
  } catch (err) {
    console.error('INSPECT ERROR:', err);
    process.exit(1);
  }
}
run();
