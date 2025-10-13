const jwt = require('jsonwebtoken');
const APIKey = require('../models/APIKey');
const User = require('../models/User');

// Middleware that accepts either a valid JWT (Authorization: Bearer ...) or x-api-key
module.exports = async function authOrApiKey(req, res, next) {
  try {
    // Try API key first
    const key = req.headers['x-api-key'];
    if (key) {
      const apiKey = await APIKey.findOne({ where: { key, status: 'active' } });
      if (!apiKey) {
        return res.status(401).json({ status: 'error', message: 'Invalid or revoked API key' });
      }
      req.apiKey = apiKey;
      if (apiKey.userId) {
        const user = await User.findByPk(apiKey.userId, { attributes: ['id', 'name', 'email', 'role'] });
        if (user) {
          req.user = user;
        }
      }
      // rate limiting and quota checks are applied elsewhere (rate limiter middleware)
      return next();
    }

    // Fallback to JWT
    const auth = req.headers.authorization || '';
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      try {
        const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'SECRET_KEY');
        const user = await User.findByPk(payload.id, { attributes: ['id', 'name', 'email', 'role'] });
        if (user) {
          req.user = user;
          return next();
        }
      } catch (e) {
        // ignore and fallthrough to unauthorized
      }
    }

    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Authentication check failed', error: err.message });
  }
};
