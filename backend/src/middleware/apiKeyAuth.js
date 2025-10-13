const APIKey = require('../models/APIKey');
const User = require('../models/User');

// Middleware to authenticate requests using x-api-key header.
// If a valid API key is provided, attaches req.apiKey and req.user (if linked) and calls next().
module.exports = async function apiKeyAuth(req, res, next) {
  try {
    const key = req.headers['x-api-key'];
    if (!key) return res.status(401).json({ status: 'error', message: 'Missing API key' });
    const apiKey = await APIKey.findOne({ where: { key, status: 'active' } });
    if (!apiKey) return res.status(401).json({ status: 'error', message: 'Invalid or revoked API key' });

    // Attach apiKey info and optional user
    req.apiKey = apiKey;
    if (apiKey.userId) {
      const user = await User.findByPk(apiKey.userId, { attributes: ['id', 'name', 'email', 'role'] });
      if (user) req.user = user;
    }

    // Simple quota enforcement
    if (apiKey.quota != null && apiKey.used != null && apiKey.quota <= apiKey.used) {
      return res.status(429).json({ status: 'error', message: 'API key quota exceeded' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'API key auth failed', error: err.message });
  }
};
