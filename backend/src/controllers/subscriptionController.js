const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const InvoiceService = require('../services/invoiceService');
const { createCheckoutSession } = require('../services/stripeService');

// Đăng ký gói subscription
exports.subscribe = async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;
    // Tính quota và giá theo tier
    let quotaDownloads = 0, quotaAPI = 0, quotaAI = 0, price = 0, billingCycle = 'monthly';
    if (tier === 'starter') {
      quotaDownloads = 50;
      quotaAPI = 50000;
      quotaAI = 50;
      price = 9.99;
    } else if (tier === 'business') {
      quotaDownloads = 500;
      quotaAPI = 500000;
      quotaAI = 500;
      price = 49.99;
    } else if (tier === 'enterprise') {
      quotaDownloads = 5000;
      quotaAPI = 5000000;
      quotaAI = 5000;
      price = 199.99;
      billingCycle = 'yearly';
    } else {
      quotaDownloads = 1;
      quotaAPI = 1000;
      quotaAI = 0;
      price = 0;
    }

    const nextBillingDate = new Date();
    if (billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    const sub = await Subscription.create({
      userId,
      tier,
      price,
      billingCycle,
      nextBillingDate,
      quotaDownloads,
      quotaAPI,
      quotaAI,
      usedDownloads: 0,
      usedAPI: 0,
      usedAI: 0,
      status: 'active',
      startDate: new Date(),
      lastBilledAt: new Date()
    });
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Hủy subscription
exports.cancel = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (!sub) {
      return res.status(404).json({ status: 'error', message: 'No active subscription' });
    }
    sub.status = 'cancelled';
    sub.endDate = new Date();
    await sub.save();
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Lấy thông tin subscription hiện tại
exports.getCurrent = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (!sub) {
      return res.status(404).json({ status: 'error', message: 'No active subscription' });
    }
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Manually trigger a renewal for the current user's active subscription (for testing)
exports.renewNow = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (!sub) {
      return res.status(404).json({ status: 'error', message: 'No active subscription' });
    }

    // If free / zero price, just advance billing date
    if (!sub.price || sub.price <= 0) {
      const now = new Date();
      if (sub.billingCycle === 'monthly') {
        sub.nextBillingDate = new Date(now.setMonth(now.getMonth() + 1));
      } else {
        sub.nextBillingDate = new Date(now.setFullYear(now.getFullYear() + 1));
      }
      sub.lastBilledAt = new Date();
      await sub.save();
      return res.json({ status: 'success', data: sub });
    }

    // Create a pending transaction representing the renewal charge
    const tx = await Transaction.create({
      consumerId: userId,
      datasetId: null,
      amount: sub.price,
      currency: 'USD',
      provider: 'system',
      status: 'pending'
    });

    // Mark as billed (in a real system you'd call Stripe subscriptions here)
    tx.status = 'completed';
    await tx.save();

    // Create invoice
    try {
      await InvoiceService.createInvoiceForTransaction(tx);
    } catch (e) {
      console.error('Invoice generation failed', e);
    }

    // Advance nextBillingDate
    const now = new Date();
    if (sub.billingCycle === 'monthly') {
      sub.nextBillingDate = new Date(now.setMonth(now.getMonth() + 1));
    } else {
      sub.nextBillingDate = new Date(now.setFullYear(now.getFullYear() + 1));
    }
    sub.lastBilledAt = new Date();
    await sub.save();

    res.json({ status: 'success', data: sub, transaction: tx });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Process due renewals across all subscriptions (used by scheduler)
exports.processDueRenewals = async () => {
  try {
    const now = new Date();
    const due = await Subscription.findAll({ where: { status: 'active' } });
    let processed = 0;
    for (const sub of due) {
      if (!sub.autoRenew) {
        continue;
      }
      if (!sub.nextBillingDate) {
        continue;
      }
      if (new Date(sub.nextBillingDate) <= now) {
        // For simplicity, create a completed transaction and invoice (simulate charge)
        const tx = await Transaction.create({
          consumerId: sub.userId,
          datasetId: null,
          amount: sub.price || 0,
          currency: 'USD',
          provider: 'system',
          status: 'completed'
        });
        try {
          await InvoiceService.createInvoiceForTransaction(tx);
        } catch (e) {
          console.error('invoice failed', e);
        }
        // Advance nextBillingDate
        const next = new Date(sub.nextBillingDate || now);
        if (sub.billingCycle === 'monthly') {
          next.setMonth(next.getMonth() + 1);
        } else {
          next.setFullYear(next.getFullYear() + 1);
        }
        sub.nextBillingDate = next;
        sub.lastBilledAt = new Date();
        await sub.save();
        processed++;
      }
    }
    return processed;

  } catch (err) {
    console.error('processDueRenewals error', err);
    return 0;
  }
};
