// Debug script to run Dataset.findAndCountAll using backend models
process.env.DB_USE_SQLITE = process.env.DB_USE_SQLITE || 'true';
const path = require('path');
const sequelize = require(path.resolve(__dirname, '../backend/src/config/database'));
const Dataset = require(path.resolve(__dirname, '../backend/src/models/Dataset'));
const User = require(path.resolve(__dirname, '../backend/src/models/User'));

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync();
    const result = await Dataset.findAndCountAll({
      where: { status: 'approved' },
      include: [{ model: User, attributes: ['name','email'], as: 'Provider' }],
      limit: 5,
      offset: 0,
      order: [['createdAt', 'DESC']]
    });
    console.log('count=', result.count);
    console.log('rows=', result.rows.map(r => ({ id: r.id, title: r.title, provider: r.Provider && r.Provider.name })))
    process.exit(0);
  } catch (err) {
    console.error('DEBUG ERROR:', err);
    process.exit(1);
  }
}
run();
