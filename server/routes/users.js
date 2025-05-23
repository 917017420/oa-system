const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// 获取所有用户列表（需要管理员权限）
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('department', 'name');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个用户信息
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查权限：只有管理员或用户本人可以查看详细信息
    if (!req.user.roles.includes('admin') && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限查看此用户信息' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户信息
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查权限：只有管理员或用户本人可以更新信息
    if (!req.user.roles.includes('admin') && !user._id.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限修改此用户信息' });
    }

    // 如果不是管理员，限制可以更新的字段
    if (!req.user.roles.includes('admin')) {
      const allowedUpdates = ['name', 'email', 'phone', 'avatar'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: '包含不允许更新的字段' });
      }
    }

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除用户（仅管理员）
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: '用户已成功删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户状态（仅管理员）
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取用于选择器的用户列表（ID 和 用户名）
router.get('/list/selectable', protect, async (req, res) => {
  try {
    const users = await User.find().select('_id username name'); // 只选择ID、用户名和姓名
    res.json(users);
  } catch (error) {
    console.error('获取可选用户列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;