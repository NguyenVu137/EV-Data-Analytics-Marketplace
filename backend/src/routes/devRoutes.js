const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const APIKey = require('../models/APIKey');
const User = require('../models/User');

// Dev-only route to create a test API key for the first user (or a provided userId)
// Usage: POST /api/dev/create-test-key  { userId: optional }
// Only enabled when NODE_ENV !== 'production'
router.post('/create-test-key', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ status: 'error', message: 'Not allowed in production' });
    }
    await require('../config/database').authenticate();
    const userId = req.body.userId || (await User.findOne())?.id || null;
    if (!userId) return res.status(400).json({ status: 'error', message: 'No user found to attach key' });
    const key = uuidv4();
    const apiKey = await APIKey.create({ userId, key, quota: 10000, used: 0, status: 'active' });
    res.json({ status: 'success', data: { id: apiKey.id, key: apiKey.key, userId: apiKey.userId } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
