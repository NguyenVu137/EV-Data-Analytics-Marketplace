const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, requestPasswordReset, resetPassword, googleAuth, verifyResetCode } = require("../controllers/authController");

router.post("/register", register);
router.post('/login', login);
router.get("/verify-email", verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.post('/verify-reset-code', verifyResetCode);

module.exports = router;
