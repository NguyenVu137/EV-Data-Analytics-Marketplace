// Run the datasetController.searchDatasets function directly with a mock req/res
process.env.DB_USE_SQLITE = process.env.DB_USE_SQLITE || 'true';
const path = require('path');
const sequelize = require(path.resolve(__dirname, '../backend/src/config/database'));
const datasetController = require(path.resolve(__dirname, '../backend/src/controllers/datasetController'));

// Minimal mock res to capture status and json
function makeRes() {
  return {
    status(code) {
      this._status = code;
      return this;
    },
    json(obj) {
      console.log('RES JSON status=', this._status || 200, JSON.stringify(obj, null, 2));
    }
  };
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected for runSearch');

    const req = { query: { page: '1', limit: '5' } };
    const res = makeRes();

    await datasetController.searchDatasets(req, res);

    process.exit(0);
  } catch (err) {
    console.error('RUNSEARCH ERROR:', err);
    process.exit(1);
  }
}

run();
