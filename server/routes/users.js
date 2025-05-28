const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  getUserStats,
  uploadAvatar,
  uploadAvatarConfig
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    获取用户列表
// @access  Private
router.get('/', auth, getUsers);

// @route   GET /api/users/stats
// @desc    获取当前用户统计信息
// @access  Private
router.get('/stats', auth, getUserStats);

// @route   PUT /api/users/profile
// @desc    更新用户信息
// @access  Private
router.put('/profile', auth, updateUser);

// @route   PUT /api/users/password
// @desc    修改密码
// @access  Private
router.put('/password', auth, changePassword);

// @route   POST /api/users/avatar
// @desc    上传用户头像
// @access  Private
router.post('/avatar', auth, uploadAvatarConfig.single('avatar'), uploadAvatar);

// @route   GET /api/users/:id
// @desc    获取用户详情
// @access  Private
router.get('/:id', auth, getUserById);

module.exports = router;