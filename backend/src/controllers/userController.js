const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    if (email && email !== user.email) {
      // Kiểm tra trùng email
      const exist = await User.findOne({ where: { email } });
      if (exist) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      user.email = email;
    }
    if (name) {
      user.name = name;
    }
    await user.save();
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    await user.destroy();
    res.json({ message: "Đã xóa tài khoản" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
