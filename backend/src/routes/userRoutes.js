const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { getMe, updateMe, deleteMe } = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

// tạo user mới
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// lấy danh sách user
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateMe);
router.delete("/me", authenticateToken, deleteMe);

module.exports = router;
