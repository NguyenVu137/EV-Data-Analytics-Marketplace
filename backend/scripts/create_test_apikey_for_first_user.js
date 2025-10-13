const { v4: uuidv4 } = require('uuid');
const sequelize = require('../src/config/database');
const APIKey = require('../src/models/APIKey');
const User = require('../src/models/User');

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();
  const user = await User.findOne();
  if (!user) {
    console.error('No users in DB. Please create a user first (register).');
    process.exit(1);
  }
  const key = uuidv4();
  const apiKey = await APIKey.create({ userId: user.id, key, quota: 10000, used: 0, status: 'active' });
  console.log('Created test API key for user', user.id, apiKey.key);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
