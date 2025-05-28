const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  verifyToken
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    用户注册
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    获取当前登录用户信息
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   GET /api/auth/verify
// @desc    验证token有效性
// @access  Private
router.get('/verify', auth, verifyToken);

module.exports = router;