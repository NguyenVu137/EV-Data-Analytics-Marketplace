const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { getMe, updateMe, deleteMe } = require("../controllers/userController");
const auth = require("../middleware/auth"); // Đã sửa export, giờ sẽ là function

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

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.delete("/me", auth, deleteMe);

module.exports = router;
