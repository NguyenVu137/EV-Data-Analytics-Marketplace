const sequelize = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function hasColumn(table, column) {
  try {
    const res = await sequelize.query(`PRAGMA table_info(${table});`, { type: QueryTypes.SELECT });
    return res.some(r => r.name === column);
  } catch (e) {
    return false;
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    const qi = sequelize.getQueryInterface();
    const table = 'Subscription';
    const cols = [
      { name: 'price', def: { type: 'FLOAT' } },
      { name: 'billingCycle', def: { type: 'STRING' } },
      { name: 'nextBillingDate', def: { type: 'DATE' } },
      { name: 'stripeSubscriptionId', def: { type: 'STRING' } },
      { name: 'stripeCustomerId', def: { type: 'STRING' } },
      { name: 'lastBilledAt', def: { type: 'DATE' } },
      { name: 'quotaAI', def: { type: 'INTEGER' } },
      { name: 'usedAI', def: { type: 'INTEGER' } },
      { name: 'quotaDownloads', def: { type: 'INTEGER' } },
      { name: 'usedDownloads', def: { type: 'INTEGER' } },
      { name: 'quotaAPI', def: { type: 'INTEGER' } },
      { name: 'usedAPI', def: { type: 'INTEGER' } }
    ];
    for (const c of cols) {
      const exists = await hasColumn(table, c.name);
      if (!exists) {
        console.log('Adding column', c.name);
        await qi.addColumn(table, c.name, c.def);
      } else {
        console.log('Column exists', c.name);
      }
    }
    console.log('Migration finished');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

run();
