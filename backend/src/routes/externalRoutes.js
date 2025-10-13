const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');
const rateLimit = require('express-rate-limit');

const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    const k = req.headers['x-api-key'];
    if (k) {
      return `apikey:${k}`;
    }
    return req.ip;
  },
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
const apiAccessController = require('../controllers/apiAccessController');

// Third-party access to dataset file via API key
// GET /external/datasets/:datasetId
router.get('/datasets/:datasetId', apiKeyRateLimiter, apiKeyAuth, async (req, res) => {
  // Use existing controller which returns file content
  return apiAccessController.getEVDataById(req, res);
});

// Simple metadata endpoint (JSON) that returns dataset info without file content
router.get('/datasets/:datasetId/metadata', apiKeyRateLimiter, apiKeyAuth, async (req, res) => {
  try {
    const Dataset = require('../models/Dataset');
    const dataset = await Dataset.findByPk(req.params.datasetId);
    if (!dataset) {
      return res.status(404).json({ status: 'error', message: 'Dataset not found' });
    }
    return res.json({ status: 'success', data: {
      id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      dataCategory: dataset.dataCategory,
      dataFormat: dataset.dataFormat,
      fileUrl: dataset.fileUrl
    }});
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
