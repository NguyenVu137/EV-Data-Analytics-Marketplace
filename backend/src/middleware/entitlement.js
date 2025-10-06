const Subscription = require('../models/Subscription');
const APIKey = require('../models/APIKey');
const Transaction = require('../models/Transaction');
const Dataset = require('../models/Dataset');

// Kiểm tra quyền truy cập dataset (mua lẻ, subscription, API)
module.exports = async function checkEntitlement(req, res, next) {
  try {
    const userId = req.user.id;
    const datasetId = req.params.datasetId || req.body.datasetId;
    if (!datasetId) return res.status(400).json({ status: 'error', message: 'Missing datasetId' });
    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset) return res.status(404).json({ status: 'error', message: 'Dataset not found' });

    // 1. Kiểm tra đã mua lẻ chưa (dùng consumerId)
    const hasPurchased = await Transaction.findOne({
      where: { consumerId: userId, datasetId, status: 'completed' }
    });
    if (hasPurchased) return next();

    // 2. Kiểm tra subscription còn quota không
    const activeSub = await Subscription.findOne({
      where: { userId, status: 'active', endDate: { $or: [null, { $gte: new Date() }] } }
    });
    if (activeSub && activeSub.quotaDownloads > activeSub.usedDownloads) return next();

    // 3. Kiểm tra API key còn quota không (nếu là API request)
    if (req.headers['x-api-key']) {
      const apiKey = await APIKey.findOne({ where: { key: req.headers['x-api-key'], status: 'active' } });
      if (apiKey && apiKey.userId === userId && apiKey.quota > apiKey.used) return next();
    }

    return res.status(403).json({ status: 'error', message: 'No entitlement for this dataset' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Entitlement check failed', error: err.message });
  }
}
