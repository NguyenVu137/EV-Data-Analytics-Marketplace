const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Simple in-memory cache { key: { ts, value } }
const cache = {};
function cacheGet(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > 5 * 60 * 1000) { // 5 minutes
    delete cache[key];
    return null;
  }
  return entry.value;
}
function cacheSet(key, value) {
  cache[key] = { ts: Date.now(), value };
}

// charging-frequency: count number of charging_station datasets grouped by week (approx by createdAt)
router.get('/charging-frequency', async (req, res) => {
  try {
    const { range = '30d', region, vehicleType } = req.query;
    const cacheKey = `charging-${range}-${region || ''}-${vehicleType || ''}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ status: 'success', data: cached });

    // compute since date
    const since = (() => {
      const now = new Date();
      if (range.endsWith('d')) { const d = parseInt(range.slice(0, -1), 10); now.setDate(now.getDate() - d); return now; }
      if (range.endsWith('m')) { const m = parseInt(range.slice(0, -1), 10); now.setMonth(now.getMonth() - m); return now; }
      return new Date(Date.now() - 30 * 24 * 3600 * 1000);
    })();

    const where = { dataCategory: 'charging_station', createdAt: { [Op.gte]: since } };
    if (region) where.region = region;
    if (vehicleType) where.vehicleType = vehicleType;

    const rows = await Dataset.findAll({ where, attributes: ['createdAt'] });
    // Group by ISO week
    const counts = {};
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const week = `${d.getUTCFullYear()}-W${getWeekNumber(d)}`;
      counts[week] = (counts[week] || 0) + 1;
    }
    const data = Object.keys(counts).sort().map(k => ({ week: k, charges: counts[k] }));
    cacheSet(cacheKey, data);
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// SoC/SoH theo tháng (demo lấy từ dataset battery_performance)
router.get('/soc-soh', async (req, res) => {
  try {
    const { range = '30d', region, vehicleType } = req.query;
    const cacheKey = `soc-${range}-${region || ''}-${vehicleType || ''}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ status: 'success', data: cached });

    // For demo, aggregate average SoC/SoH per arbitrary bucket using dataset.samplePreview or dataFields
    // Here we approximate by sampling datasets in category battery_performance
    const where = { dataCategory: 'battery_performance' };
    if (region) where.region = region;
    if (vehicleType) where.vehicleType = vehicleType;
    const rows = await Dataset.findAll({ where });
    const data = rows.slice(0, 10).map((r, i) => ({ name: `T${i+1}`, SoC: Math.max(50, Math.round(Math.random()*50 + 50)), SoH: Math.max(80, Math.round(Math.random()*20 + 80)) }));
    cacheSet(cacheKey, data);
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Quãng đường di chuyển theo tháng (demo)
router.get('/distance', async (req, res) => {
  try {
    const cacheKey = `distance`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ status: 'success', data: cached });
    const rows = await Dataset.findAll({ where: { dataCategory: 'driving_behavior' } });
    const data = ['Jan','Feb','Mar','Apr','May','Jun'].map((m, idx) => ({ month: m, km: Math.floor(Math.random()*400 + 200) }));
    cacheSet(cacheKey, data);
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Lượng CO2 tiết kiệm (demo)
router.get('/co2', async (req, res) => {
  try {
    const cacheKey = `co2`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ status: 'success', data: cached });
    const data = [ { name: 'Tiết kiệm', value: 120 + Math.floor(Math.random()*50) }, { name: 'Thải ra', value: 30 + Math.floor(Math.random()*10) }];
    cacheSet(cacheKey, data);
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Return distinct regions present in datasets
router.get('/regions', async (req, res) => {
  try {
    const rows = await Dataset.findAll({ attributes: [ 'region' ], where: { region: { [Op.ne]: null } }, group: ['region'] });
    const regions = rows.map(r => r.region).filter(Boolean);
    res.json({ status: 'success', data: regions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Return distinct vehicle types present in datasets
router.get('/vehicle-types', async (req, res) => {
  try {
    const rows = await Dataset.findAll({ attributes: [ 'vehicleType' ], where: { vehicleType: { [Op.ne]: null } }, group: ['vehicleType'] });
    const types = rows.map(r => r.vehicleType).filter(Boolean);
    res.json({ status: 'success', data: types });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return String(weekNo).padStart(2, '0');
}

module.exports = router;
