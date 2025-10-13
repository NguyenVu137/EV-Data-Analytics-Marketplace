let stripe = null;
function getStripe() {
  if (stripe) return stripe;
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) {
    // return null so callers can handle missing key gracefully
    return null;
  }
  stripe = new Stripe(key, { apiVersion: '2022-11-15' });
  return stripe;
}

async function createCheckoutSession({ price, currency = 'usd', successUrl, cancelUrl, metadata = {} }) {
  const _stripe = getStripe();
  if (!_stripe) throw new Error('Stripe not configured (STRIPE_SECRET_KEY missing)');
  // For simplicity create a one-time payment with amount in cents
  const session = await _stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency, product_data: { name: metadata.productName || 'Dataset' }, unit_amount: Math.round(price * 100) }, quantity: 1 }],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
  return session;
}

function constructEvent(rawBody, sig) {
  const _stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!_stripe || !webhookSecret) return null;
  try {
    return _stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { createCheckoutSession, constructEvent, getStripe };
