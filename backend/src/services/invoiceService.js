const fs = require('fs');
const path = require('path');
const Invoice = require('../models/Invoice');
let PDFDocument = null;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  // pdfkit optional
}

async function generateInvoiceJson(invoice) {
  // write a simple json invoice file and update invoice.pdfPath to point to it (name kept .json)
  const outDir = path.resolve(__dirname, '..', '..', 'invoices');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const filename = `invoice_${invoice.id || Date.now()}.json`;
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(invoice, null, 2));
  return filepath;
}

async function createInvoiceForTransaction(transaction) {
  const inv = await Invoice.create({
    transactionId: transaction.id,
    userId: transaction.consumerId || null,
    amount: transaction.amount,
    currency: transaction.currency || 'USD',
    issuedAt: new Date(),
    lines: JSON.stringify([{ description: `Purchase dataset ${transaction.datasetId}`, amount: transaction.amount }])
  });
  const filepath = await generateInvoiceJson(inv);
  // If PDF capability present, generate PDF and set pdfPath; otherwise keep JSON path
  if (PDFDocument) {
    try {
      const pdfFilename = `invoice_${inv.id}.pdf`;
      const pdfPath = path.join(path.dirname(filepath), pdfFilename);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);
      doc.fontSize(18).text('Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice ID: ${inv.id}`);
      doc.text(`Transaction ID: ${inv.transactionId}`);
      doc.text(`User ID: ${inv.userId}`);
      doc.text(`Amount: ${inv.amount} ${inv.currency}`);
      doc.text(`Issued at: ${inv.issuedAt}`);
      doc.moveDown();
      try {
        const lines = JSON.parse(inv.lines || '[]');
        for (const l of lines) {
          doc.text(`- ${l.description}: ${l.amount}`);
        }
      } catch (e) {
        doc.text(inv.lines || '');
      }
      doc.end();
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      inv.pdfPath = pdfPath;
    } catch (e) {
      // fallback to json path
      inv.pdfPath = filepath;
    }
  } else {
    inv.pdfPath = filepath;
  }
  await inv.save();
  return inv;
}

module.exports = { createInvoiceForTransaction, generateInvoiceJson };
