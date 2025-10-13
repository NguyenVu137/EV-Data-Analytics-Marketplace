const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Invoice = require('../src/models/Invoice');
const db = require('../src/config/database');

async function invoiceToPdf(inv, outDir) {
  const doc = new PDFDocument();
  const filename = `invoice_${inv.id}.pdf`;
  const filepath = path.join(outDir, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice ID: ${inv.id}`);
  doc.text(`Transaction ID: ${inv.transactionId}`);
  doc.text(`User ID: ${inv.userId}`);
  doc.text(`Amount: ${inv.amount} ${inv.currency}`);
  doc.text(`Issued at: ${inv.issuedAt}`);
  doc.moveDown();
  doc.text('Lines:');
  try {
    const lines = JSON.parse(inv.lines || '[]');
    for (const l of lines) {
      doc.text(`- ${l.description}: ${l.amount}`);
    }
  } catch (e) {
    doc.text(inv.lines || '');
  }

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);
  });
}

async function run() {
  await db.authenticate();
  const outDir = path.resolve(__dirname, '..', 'invoices');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const invoices = await Invoice.findAll();
  console.log('Generating PDFs for', invoices.length, 'invoices');
  for (const inv of invoices) {
    try {
      const pdfPath = await invoiceToPdf(inv, outDir);
      inv.pdfPath = pdfPath;
      await inv.save();
      console.log('Generated', pdfPath);
    } catch (e) {
      console.error('Failed to generate PDF for', inv.id, e.message);
    }
  }
  console.log('Done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
