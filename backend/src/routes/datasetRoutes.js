const express = require("express");
const router = express.Router();
const Dataset = require('../models/Dataset');
const datasetController = require('../controllers/datasetController');
const authenticateToken = require('../middleware/auth');
const checkEntitlement = require('../middleware/entitlement');

// Consumer Routes - Tìm kiếm và khám phá dữ liệu
router.get('/search', datasetController.searchDatasets); // Public route
router.get('/categories', datasetController.getCategories); // Public route
router.get('/:id', datasetController.getDatasetDetails); // Public route

// Download dataset (cần entitlement)
router.get('/download/:datasetId', authenticateToken, checkEntitlement, datasetController.downloadDataset);

// Provider Routes - Quản lý dataset
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, price, fileUrl, dataCategory, 
      region, vehicleType, batteryType, dataFormat, timeRange,
      usageRights, isAnonymized } = req.body;

    // If providerId is available from authenticated user, use it; otherwise allow null
    const providerId = req.user?.id || null;

    const dataset = await Dataset.create({
      title,
      description,
      price,
      fileUrl,
      providerId,
    });

    res.json({ message: "Dataset created", dataset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Note: dataset details route is handled above by datasetController.getDatasetDetails

module.exports = router;
