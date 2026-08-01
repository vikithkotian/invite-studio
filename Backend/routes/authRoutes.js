const express = require("express");
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

// @route   POST /api/auth/signup
router.post("/signup", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password/:token
router.post("/reset-password/:token", resetPassword);

module.exports = router;
