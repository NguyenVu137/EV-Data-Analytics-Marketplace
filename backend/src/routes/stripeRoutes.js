const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripeService = require('../services/stripeSubscriptionService');

// Create a subscription for the authenticated user (requires STRIPE keys configured)
router.post('/create-subscription', auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    const userEmail = req.user && req.user.email;
    if (!priceId) {
      return res.status(400).json({ status: 'error', message: 'Missing priceId' });
    }
    const stripe = stripeService.getStripe();
    if (!stripe) {
      return res.status(501).json({ status: 'error', message: 'Stripe not configured on this server' });
    }
    const customer = await stripeService.createCustomerIfNotExists(userEmail);
    const subscription = await stripeService.createSubscription(customer.id, priceId);
    res.json({ status: 'success', data: subscription });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
