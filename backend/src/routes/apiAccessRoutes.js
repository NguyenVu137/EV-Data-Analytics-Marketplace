const express = require('express');
const router = express.Router();
const apiAccessController = require('../controllers/apiAccessController');
const authenticateToken = require('../middleware/auth');

// API truy cập dữ liệu EV cho bên thứ ba
// GET /api/evdata/:datasetId
router.get('/evdata/:datasetId', authenticateToken, apiAccessController.getEVDataById);

// (Có thể mở rộng thêm các route filter nâng cao ở đây)

module.exports = router;
