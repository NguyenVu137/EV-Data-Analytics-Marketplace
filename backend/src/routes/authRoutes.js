const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, requestPasswordReset, googleAuth, verifyResetCode } = require("../controllers/authController");
console.log('authController exports:', { register, login, verifyEmail, requestPasswordReset, googleAuth, verifyResetCode });

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
// router.post('/reset-password', resetPassword); // Chưa có hàm này, tạm thời bỏ qua
router.post('/google', googleAuth);
router.post('/verify-reset-code', verifyResetCode);

module.exports = router;
