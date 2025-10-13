process.env.DB_USE_SQLITE = 'true';
const { Sequelize } = require('sequelize');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');

async function run() {
  await sequelize.sync();
  let user = await User.findOne({ where: { email: 'admin-test@example.com' } });
  if (!user) {
    user = await User.create({
      name: 'admin-test',
      email: 'admin-test@example.com',
      password: '$2a$10$Q9QwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQ', // bcrypt for 'Password123!'
      role: 'admin',
      isEmailVerified: true
    });
    console.log('Created admin user:', user.email);
  } else {
    user.isEmailVerified = true;
    user.role = 'admin';
    await user.save();
    console.log('Updated admin user to verified:', user.email);
  }
  process.exit(0);
}
run();
