const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');

// API trả về thống kê tần suất sạc theo tuần (demo: đếm số dataset charging_station theo tuần)
router.get('/charging-frequency', async (req, res) => {
  try {
    // Dữ liệu cố định demo
    const data = [
      { week: '2023-W01', charges: 5 },
      { week: '2023-W02', charges: 7 },
      { week: '2023-W03', charges: 4 },
      { week: '2023-W04', charges: 6 },
      { week: '2023-W05', charges: 8 },
      { week: '2023-W06', charges: 3 },
      { week: '2023-W07', charges: 5 },
      { week: '2023-W08', charges: 6 },
      { week: '2023-W09', charges: 7 },
      { week: '2023-W10', charges: 4 }
    ];
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// SoC/SoH theo tháng (demo lấy từ dataset battery_performance)
router.get('/soc-soh', async (req, res) => {
  try {
    // Dữ liệu cố định demo
    const data = [
      { name: 'T1', SoC: 80, SoH: 95 },
      { name: 'T2', SoC: 75, SoH: 94 },
      { name: 'T3', SoC: 70, SoH: 94 },
      { name: 'T4', SoC: 85, SoH: 93 },
      { name: 'T5', SoC: 90, SoH: 93 }
    ];
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Quãng đường di chuyển theo tháng (demo)
router.get('/distance', async (req, res) => {
  try {
    // Dữ liệu cố định demo
    const data = [
      { month: 'Jan', km: 320 },
      { month: 'Feb', km: 280 },
      { month: 'Mar', km: 350 },
      { month: 'Apr', km: 400 },
      { month: 'May', km: 370 }
    ];
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Lượng CO2 tiết kiệm (demo)
router.get('/co2', async (req, res) => {
  try {
    // Dữ liệu cố định demo
    const data = [
      { name: 'Tiết kiệm', value: 120 },
      { name: 'Thải ra', value: 30 }
    ];
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
