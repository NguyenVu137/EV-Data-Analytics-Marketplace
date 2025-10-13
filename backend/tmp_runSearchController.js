// Run dataset controller.searchDatasets directly to see full error/stack
process.env.DB_USE_SQLITE = process.env.DB_USE_SQLITE || 'true';
const datasetController = require('./src/controllers/datasetController');
const sequelize = require('./src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const req = { query: { page: '1', limit: '5' } };
    const res = {
      statusCode: 200,
      sent: null,
      status(code) { this.statusCode = code; return this; },
      json(obj) { this.sent = obj; console.log('>> res.json called:', JSON.stringify(obj, null, 2)); }
    };

    await datasetController.searchDatasets(req, res);
    console.log('Done invoking searchDatasets');
    process.exit(0);
  } catch (err) {
    console.error('RUN ERROR:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}
run();
