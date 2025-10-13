const { v4: uuidv4 } = require('uuid');
const sequelize = require('../src/config/database');
const APIKey = require('../src/models/APIKey');

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();
  const key = uuidv4();
  const apiKey = await APIKey.create({ userId: null, key, quota: 10000, used: 0, status: 'active' });
  console.log('Created test API key:', apiKey.key);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
