const Subscription = require('../models/Subscription');

// Đăng ký gói subscription
exports.subscribe = async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;
    // TODO: kiểm tra tier, tính quota theo tier
    let quotaDownloads = 0, quotaAPI = 0;
    if (tier === 'starter') { quotaDownloads = 50; quotaAPI = 50000; }
    else if (tier === 'business') { quotaDownloads = 500; quotaAPI = 500000; }
    else if (tier === 'enterprise') { quotaDownloads = 5000; quotaAPI = 5000000; }
    else { quotaDownloads = 1; quotaAPI = 1000; }
    const sub = await Subscription.create({
      userId, tier, quotaDownloads, quotaAPI, usedDownloads: 0, usedAPI: 0, status: 'active', startDate: new Date()
    });
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Hủy subscription
exports.cancel = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (!sub) return res.status(404).json({ status: 'error', message: 'No active subscription' });
    sub.status = 'cancelled';
    sub.endDate = new Date();
    await sub.save();
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Lấy thông tin subscription hiện tại
exports.getCurrent = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (!sub) return res.status(404).json({ status: 'error', message: 'No active subscription' });
    res.json({ status: 'success', data: sub });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
