const { Sequelize } = require('sequelize');
const path = require('path');
const db = require('../src/config/database');
const Invoice = require('../src/models/Invoice');
const Transaction = require('../src/models/Transaction');

async function run() {
  console.log('Starting invoice backfill...');
  await db.authenticate();
  console.log('DB connected');
  const invoices = await Invoice.findAll({ where: { userId: null } });
  console.log('Found', invoices.length, 'invoices with null userId');
  let patched = 0;
  for (const inv of invoices) {
    if (!inv.transactionId) {
      continue;
    }
    const tx = await Transaction.findByPk(inv.transactionId);
    if (tx && tx.consumerId) {
      inv.userId = tx.consumerId;
      await inv.save();
      patched++;
      console.log(`Patched invoice ${inv.id} -> user ${inv.userId}`);
    }
  }
  console.log('Backfill complete. Patched:', patched);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
