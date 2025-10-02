const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Dataset = require("../models/Dataset");
const User = require("../models/User");

// Consumer mua dataset
router.post("/", async (req, res) => {
  try {
    const { consumerId, datasetId } = req.body;

    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });

    const transaction = await Transaction.create({
      consumerId,
      datasetId,
      amount: dataset.price,
      status: "completed"
    });

    res.json({ message: "Transaction successful", transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả giao dịch
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ include: [User, Dataset] });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy giao dịch theo consumerId
router.get("/consumer/:id", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { consumerId: req.params.id },
      include: Dataset
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
