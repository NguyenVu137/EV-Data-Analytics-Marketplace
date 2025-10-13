const { Sequelize, QueryTypes } = require('sequelize');
const path = require('path');

async function countRows(dbPath) {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: dbPath, logging: false });
  try {
    await sequelize.authenticate();
    const datasetCount = await sequelize.query("SELECT count(*) as c FROM Dataset", { type: QueryTypes.SELECT }).catch(() => [{c:0}]);
    const userCount = await sequelize.query("SELECT count(*) as c FROM User", { type: QueryTypes.SELECT }).catch(() => [{c:0}]);
    console.log(`DB: ${dbPath}`);
    console.log('  Users:', (userCount && userCount[0] && userCount[0].c) || 0);
    console.log('  Datasets:', (datasetCount && datasetCount[0] && datasetCount[0].c) || 0);
  } catch (err) {
    console.error('Error opening', dbPath, err.message);
  } finally {
    await sequelize.close();
  }
}

(async () => {
  const file1 = path.resolve('backend/sqlite-dev.db');
  const file2 = path.resolve('backend/backend/sqlite-dev.db');
  await countRows(file1);
  await countRows(file2);
})();
