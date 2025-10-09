const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/User.js");
const EmailVerificationToken = require('../models/EmailVerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');

// Hàm gửi email xác thực
async function sendVerificationEmail(user, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@evmarket.com',
    to: user.email,
    subject: 'Xác thực email EV Data Marketplace',
    html: `<p>Chào ${user.name},</p><p>Vui lòng xác thực email bằng cách bấm vào link sau:</p><a href="${verifyUrl}">${verifyUrl}</a><p>Link này sẽ hết hạn sau 24h.</p>`
  });
}

// Gửi email reset mật khẩu
async function sendResetPasswordEmail(user, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@evmarket.com',
    to: user.email,
    subject: 'Yêu cầu đặt lại mật khẩu EV Data Marketplace',
    html: `<p>Chào ${user.name},</p><p>Bạn vừa yêu cầu đặt lại mật khẩu. Bấm vào link sau để đặt lại mật khẩu mới:</p><a href="${resetUrl}">${resetUrl}</a><p>Link này sẽ hết hạn sau 15 phút.</p>`
  });
}

// Register
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // check trùng email
    const existUser = await User.findOne({ where: { email } });
    if (existUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
    });

    // Tạo token xác thực email
    const token = uuidv4();
    await EmailVerificationToken.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    });
    // Gửi email xác thực
    await sendVerificationEmail(user, token);

    res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Tài khoản chưa xác thực email. Vui lòng kiểm tra email." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1h" }
    );
    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Thiếu token xác thực' });
    }
    const record = await EmailVerificationToken.findOne({ where: { token } });
    if (!record) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã được xác thực' });
    }
    if (record.expiresAt < new Date()) {
      await record.destroy();
      return res.status(400).json({ message: 'Token đã hết hạn' });
    }
    const user = await User.findByPk(record.userId);
    if (!user) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }
    user.isEmailVerified = true;
    await user.save();
    await record.destroy();
    res.json({ message: 'Xác thực email thành công. Bạn có thể đăng nhập.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Yêu cầu reset mật khẩu (gửi mã xác thực về email)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Thiếu email' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.' });
    }
    // Tạo mã xác thực 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await PasswordResetToken.destroy({ where: { userId: user.id } }); // Xóa mã cũ nếu có
    await PasswordResetToken.create({
      userId: user.id,
      token: code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 phút
    });
    // Gửi mã về email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@evmarket.com',
      to: user.email,
      subject: 'Mã xác thực đổi mật khẩu EV Data Marketplace',
      html: `<p>Mã xác thực đổi mật khẩu của bạn là: <b>${code}</b> (có hiệu lực 15 phút).</p>`
    });
    res.json({ message: 'Mã xác thực đã được gửi về email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xác thực mã và đổi mật khẩu
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại' });
    }
    const record = await PasswordResetToken.findOne({ where: { userId: user.id, token: code } });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await record.destroy();
    res.json({ message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset password using token (from email link)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const record = await PasswordResetToken.findOne({ where: { token } });
    if (!record) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    if (record.expiresAt < new Date()) {
      await record.destroy();
      return res.status(400).json({ message: 'Token đã hết hạn' });
    }

    const user = await User.findByPk(record.userId);
    if (!user) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await record.destroy();

     res.json({ message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập bằng Google (chỉ cho phép user đã đăng ký Google)
exports.googleAuth = async (req, res) => {
  try {
    const { credential, mode } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Thiếu credential từ Google' });
    }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // Xác thực token Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: 'Không lấy được email từ Google' });
    }
    let user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      // Nếu mode là 'register' thì cho phép tạo user mới
      if (mode === 'register') {
        user = await User.create({
          name: payload.name || payload.email,
          email: payload.email,
          password: '',
          isEmailVerified: true,
          role: 'consumer',
        });
      } else {
        return res.status(404).json({ message: 'Tài khoản Google này chưa đăng ký. Vui lòng đăng ký trước.' });
      }
    } else if (mode === 'register') {
      // Nếu đã có user mà vẫn gọi đăng ký thì báo lỗi
      return res.status(400).json({ message: 'Tài khoản Google này đã được đăng ký. Vui lòng đăng nhập.' });
    }
    // Tạo JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Google xác thực thất bại', error: err.message });
  }
};
