const APIKey = require('../models/APIKey');
const { v4: uuidv4 } = require('uuid');
const Dataset = require('../models/Dataset');
const path = require('path');
const fs = require('fs');
const ApiUsageLog = require('../models/ApiUsageLog');

// Lấy hoặc tạo API key cho user
exports.getOrCreateKey = async (req, res) => {
  try {
    const userId = req.user.id;
    let apiKey = await APIKey.findOne({ where: { userId, status: 'active' } });
    if (!apiKey) {
      apiKey = await APIKey.create({ userId, key: uuidv4(), quota: 1000, used: 0, status: 'active' });
    }
    res.json({ status: 'success', data: apiKey });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Gia hạn/quản lý quota API key
exports.renewKey = async (req, res) => {
  try {
    const userId = req.user.id;
    let apiKey = await APIKey.findOne({ where: { userId, status: 'active' } });
    if (!apiKey) {
      return res.status(404).json({ status: 'error', message: 'No active API key' });
    }
    apiKey.quota += 1000; // ví dụ: cộng thêm quota
    await apiKey.save();
    res.json({ status: 'success', data: apiKey });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// API cho phép bên thứ ba truy cập dữ liệu EV theo datasetId
exports.getEVDataById = async (req, res) => {
  const start = Date.now();
  let logRecord = null;
  try {
    const { datasetId } = req.params;
    const format = (req.query.format || 'json').toLowerCase();
    const fields = req.query.fields ? req.query.fields.split(',').map(f => f.trim()) : null;
    const limit = parseInt(req.query.limit) || null;
    const offset = parseInt(req.query.offset) || 0;

    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset || !dataset.fileUrl) {
      await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 404 });
      return res.status(404).json({ status: 'error', message: 'Dataset or file not found' });
    }

    const filePath = path.isAbsolute(dataset.fileUrl) ? dataset.fileUrl : path.join(__dirname, '../../', dataset.fileUrl);
    if (!fs.existsSync(filePath)) {
      await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 404 });
      return res.status(404).json({ status: 'error', message: 'File not found on server' });
    }

    const raw = fs.readFileSync(filePath, 'utf8');

    // Support JSON datasets (assume .json) or CSV files
    if (format === 'csv') {
      // Stream CSV directly from file for CSV files
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      // Increment usage and log after response
      if (req.apiKey) {
        try {
          req.apiKey.used = (req.apiKey.used || 0) + 1;
          await req.apiKey.save();
        } catch (e) {
          console.warn('Failed to update apiKey usage:', e.message);
        }
      }
      await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 200 });
      return res.send(raw);
    }

    // JSON or filtered fields
    let data = null;
    try {
      if (path.extname(filePath).toLowerCase() === '.json') {
        data = JSON.parse(raw);
      } else {
        // Parse CSV into array of objects (simple split - suitable for small files)
        const lines = raw.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).map(line => {
          const cols = line.split(',');
          const obj = {};
          headers.forEach((h, i) => { obj[h] = cols[i]; });
          return obj;
        });
      }
    } catch (e) {
      await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 500 });
      return res.status(500).json({ status: 'error', message: 'Failed to parse dataset', error: e.message });
    }

    // apply fields, offset, limit
    if (fields && Array.isArray(data)) {
      data = data.map(row => {
        const out = {};
        fields.forEach(f => {
          if (row.hasOwnProperty(f)) {
            out[f] = row[f];
          }
        });
        return out;
      });
    }
    if (offset) {
      data = Array.isArray(data) ? data.slice(offset) : data;
    }
    if (limit && Array.isArray(data)) {
      data = data.slice(0, limit);
    }

    // Remove sensitive fields if present
    const sanitize = obj => {
      if (obj.password) {
        delete obj.password;
      }
      if (obj.email && !req.user) {
        delete obj.email; // only include emails when requester is authenticated user
      }
      return obj;
    };
    if (Array.isArray(data)) {
      data = data.map(sanitize);
    } else if (typeof data === 'object') {
      data = sanitize(data);
    }

    // Increment API key usage and subscription quota if applicable
    if (req.apiKey) {
      try {
        req.apiKey.used = (req.apiKey.used || 0) + 1;
        await req.apiKey.save();
      } catch (e) {
        console.warn('Failed to update apiKey usage:', e.message);
      }
    }
    // If user has active subscription, increment usedAPI via Subscription model
    try {
      if (req.user) {
        const Subscription = require('../models/Subscription');
        const sub = await Subscription.findOne({ where: { userId: req.user.id, status: 'active' } });
        if (sub && sub.usedAPI != null) {
          sub.usedAPI = (sub.usedAPI || 0) + 1;
          // Also count as a download if dataset file exists
          if (dataset && dataset.fileUrl && sub.usedDownloads != null) {
            sub.usedDownloads = (sub.usedDownloads || 0) + 1;
          }
          await sub.save();
        }
      }
    } catch (e) {
      console.warn('Failed to update subscription usage:', e.message);
    }

    await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 200 });

    return res.json({ status: 'success', data });
  } catch (err) {
    try { await ApiUsageLog.create({ apiKeyId: req.apiKey ? req.apiKey.id : null, userId: req.user ? req.user.id : null, path: req.path, method: req.method, query: JSON.stringify(req.query), params: JSON.stringify(req.params), responseStatus: 500 }); } catch(e){}
    return res.status(500).json({ status: 'error', message: 'API access failed', error: err.message });
  }
};
