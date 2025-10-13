const stripeLib = require('stripe');

let stripe = null;
function getStripe() {
  if (stripe) {
    return stripe;
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  stripe = stripeLib(key);
  return stripe;
}

async function createCustomerIfNotExists(email) {
  const s = getStripe();
  if (!s) {
    return null;
  }
  const customers = await s.customers.list({ email, limit: 1 });
  if (customers.data && customers.data.length > 0) {
    return customers.data[0];
  }
  return await s.customers.create({ email });
}

async function createSubscription(customerId, priceId) {
  const s = getStripe();
  if (!s) {
    throw new Error('Stripe not configured');
  }
  return await s.subscriptions.create({ customer: customerId, items: [{ price: priceId }] });
}

module.exports = { getStripe, createCustomerIfNotExists, createSubscription };
