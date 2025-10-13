const express = require('express');
const router = express.Router();
const apiAccessController = require('../controllers/apiAccessController');
const authOrApiKey = require('../middleware/authOrApiKey');
const authenticateToken = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for API keys: 100 req per hour per IP (or per API key - we will key by IP by default)
const apiKeyRateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 100,
	keyGenerator: (req /*, res*/) => {
		// Prefer to rate-limit by API key if provided, otherwise by IP
		const k = req.headers['x-api-key'];
		if (k) {
			return `apikey:${k}`;
		}
		return req.ip;
	},
	message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// API truy cập dữ liệu EV cho bên thứ ba
// GET /api/evdata/:datasetId - allow JWT OR x-api-key
router.get('/evdata/:datasetId', apiKeyRateLimiter, authOrApiKey, apiAccessController.getEVDataById);

// API key management for authenticated users
// GET /api/key -> get or create an API key for the logged in user
router.get('/key', authenticateToken, apiAccessController.getOrCreateKey);

// POST /api/key/renew -> renew/increase quota for logged in user
router.post('/key/renew', authenticateToken, apiAccessController.renewKey);

// Revoke the currently active API key for the authenticated user
router.post('/key/revoke', authenticateToken, async (req, res) => {
	try {
		const APIKey = require('../models/APIKey');
		const userId = req.user.id;
		const apiKey = await APIKey.findOne({ where: { userId, status: 'active' } });
			if (!apiKey) {
				return res.status(404).json({ status: 'error', message: 'No active API key' });
			}
			apiKey.status = 'revoked';
			await apiKey.save();
			return res.json({ status: 'success', message: 'API key revoked' });
	} catch (err) {
		return res.status(500).json({ status: 'error', message: err.message });
	}
});

// Rotate key: revoke old and create new one
router.post('/key/rotate', authenticateToken, async (req, res) => {
	try {
		const APIKey = require('../models/APIKey');
		const { v4: uuidv4 } = require('uuid');
		const userId = req.user.id;
		const old = await APIKey.findOne({ where: { userId, status: 'active' } });
			if (old) {
				old.status = 'revoked';
				await old.save();
			}
		const nk = await APIKey.create({ userId, key: uuidv4(), quota: 1000, used: 0, status: 'active' });
		return res.json({ status: 'success', data: { id: nk.id, key: nk.key } });
	} catch (err) {
		return res.status(500).json({ status: 'error', message: err.message });
	}
});

module.exports = router;
