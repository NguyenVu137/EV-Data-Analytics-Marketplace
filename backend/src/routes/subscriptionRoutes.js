const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subCtrl = require('../controllers/subscriptionController');
const Invoice = require('../models/Invoice');
const path = require('path');

router.post('/subscribe', auth, subCtrl.subscribe);
router.post('/cancel', auth, subCtrl.cancel);
router.get('/current', auth, subCtrl.getCurrent);
router.post('/renew-now', auth, subCtrl.renewNow); // testing endpoint

// Admin trigger to process all due renewals immediately (for testing/admins)
router.post('/process-due', auth, async (req, res) => {
	try {
		// very small role check if user object contains role
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ status: 'error', message: 'Forbidden' });
		}
		const processed = await subCtrl.processDueRenewals();
		res.json({ status: 'success', processed });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
});

// List invoices for current user
router.get('/invoices', auth, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		const invoices = await Invoice.findAll({ where: { userId } });
		res.json({ status: 'success', data: invoices });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
});

// Get specific invoice (serve file if exists)
router.get('/invoices/:id', auth, async (req, res) => {
	try {
		const inv = await Invoice.findByPk(req.params.id);
		if (!inv) {
			return res.status(404).json({ status: 'error', message: 'Invoice not found' });
		}
		if (inv.userId && inv.userId !== (req.user && req.user.id) && req.user.role !== 'admin') {
			return res.status(403).json({ status: 'error', message: 'Forbidden' });
		}
		if (inv.pdfPath && require('fs').existsSync(inv.pdfPath)) {
			return res.sendFile(path.resolve(inv.pdfPath));
		}
		res.json({ status: 'success', data: inv });
	} catch (err) {
		res.status(500).json({ status: 'error', message: err.message });
	}
});

module.exports = router;

