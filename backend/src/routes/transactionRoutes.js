const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Dataset = require("../models/Dataset");
const User = require("../models/User");
const authenticateToken = require('../middleware/auth');
const { createCheckoutSession, constructEvent, stripe } = require('../services/stripeService');
const fs = require('fs');
const path = require('path');
const Invoice = require('../models/Invoice');
const { generateInvoiceJson } = require('../services/invoiceService');

// Consumer mua dataset
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { datasetId, provider, currency, paymentIntentId } = req.body;
    const consumerId = req.user && req.user.id;

    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    // Create as pending; actual payment processed via Stripe checkout/webhook
    const transaction = await Transaction.create({
      consumerId,
      datasetId,
      amount: dataset.price,
      currency: currency || 'USD',
      paymentIntentId: paymentIntentId || null,
      provider: provider || 'stripe',
      status: 'pending'
    });

    res.json({ message: 'Transaction created', transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả giao dịch
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ include: [User, Dataset] });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy giao dịch theo consumerId
router.get("/consumer/:id", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { consumerId: req.params.id },
      include: [Dataset, Invoice]
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve invoice JSON file or metadata
router.get('/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    if (inv.pdfPath && require('fs').existsSync(inv.pdfPath)) {
      return res.sendFile(inv.pdfPath);
    }
    // fallback: return invoice record as JSON
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a Stripe Checkout session for a dataset purchase
router.post('/payments/create-session', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.body;
    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/cancel`;

    const session = await createCheckoutSession({
      price: dataset.price || 0,
      currency: 'usd',
      successUrl,
      cancelUrl,
      metadata: { datasetId: String(dataset.id), consumerId: String(req.user.id), productName: dataset.title }
    });

    // create pending transaction record tied to session id
    const transaction = await Transaction.create({
      consumerId: req.user.id,
      datasetId: dataset.id,
      amount: dataset.price || 0,
      currency: 'USD',
      paymentIntentId: session.payment_intent || session.id,
      provider: 'stripe',
      status: 'pending'
    });

    res.json({ id: session.id, url: session.url, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook endpoint
router.post('/payments/webhook', express.text({ type: '*/*' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = constructEvent(req.body, sig);
  if (!event) {
    return res.status(400).send('Invalid webhook signature');
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const datasetId = session.metadata?.datasetId;
      const consumerId = session.metadata?.consumerId;

      // Find transaction by paymentIntentId or matching pending transaction
      let transaction = null;
      if (session.payment_intent) {
        transaction = await Transaction.findOne({ where: { paymentIntentId: session.payment_intent } });
      }
      if (!transaction && session.id) {
        transaction = await Transaction.findOne({ where: { paymentIntentId: session.id, status: 'pending' } });
      }

      if (transaction) {
        transaction.status = 'completed';
        await transaction.save();

        // Create a basic invoice record
        let invoice = await Invoice.create({
          transactionId: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency || 'USD',
          issuedAt: new Date(),
          lines: JSON.stringify([{ description: `Purchase dataset ${transaction.datasetId}`, amount: transaction.amount }])
        });
        try {
          const filepath = await generateInvoiceJson(invoice);
          invoice.pdfPath = filepath;
          await invoice.save();
        } catch (e) {
          console.error('Failed to generate invoice file', e);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    res.status(500).send();
  }
});

module.exports = router;

