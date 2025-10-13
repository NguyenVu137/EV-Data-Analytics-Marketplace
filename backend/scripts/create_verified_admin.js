const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();
  const email = 'local-admin@example.com';
  const name = 'local-admin';
  const password = 'Password123!';
  const hashed = await bcrypt.hash(password, 10);
  let user = await User.findOne({ where: { email } });
  if (user) {
    console.log('User exists, updating...');
    user.name = name;
    user.password = hashed;
    user.role = 'admin';
    user.isEmailVerified = true;
    await user.save();
  } else {
    user = await User.create({ name, email, password: hashed, role: 'admin', isEmailVerified: true });
    console.log('Created user id=', user.id);
  }
  console.log('Admin ready:', { email, password });
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
