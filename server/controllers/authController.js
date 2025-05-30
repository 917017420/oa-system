const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Multer 配置 - 用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
    // 确保这个目录存在，如果不存在则创建它
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const userId = req.user.id; // 从 protect 中间件获取用户ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, userId + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB 文件大小限制
  },
  fileFilter: fileFilter
});

exports.uploadMiddleware = upload.single('avatar'); // 'avatar' 是表单字段名

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, roles, name, email, department, position, phone } = req.body;

    // 检查用户名是否已存在
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: '用户名已被注册' });
      }
    }
    
    // 检查邮箱是否已存在 (如果提供了邮箱)
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: '邮箱已被注册' });
      }
    }

    // 创建新用户
    const newUser = {
      username,
      password,
      roles: roles || ['employee'], // 如果没有提供角色，默认为 employee
    };

    // 添加可选字段
    if (name) newUser.name = name;
    if (email) newUser.email = email;
    if (department) newUser.department = department;
    if (position) newUser.position = position;
    if (phone) newUser.phone = phone;

    const user = new User(newUser);

    await user.save();

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 上传用户头像
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id; // 从路由参数获取用户ID
    // 验证操作权限：只有用户自己或管理员可以上传头像
    if (req.user.id !== userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: '没有权限修改此用户的头像' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '没有选择头像文件' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    user.avatar = avatarPath;
    await user.save();

    res.json({
      success: true,
      message: '头像上传成功',
      avatarUrl: avatarPath,
      user: {
        id: user._id,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('头像上传错误:', error);
    if (error.message === '只允许上传图片文件!') {
        return res.status(400).json({ message: error.message });
    }
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '文件过大，最大允许5MB' });
        }
        return res.status(400).json({ message: `Multer错误: ${error.message}` });
    }
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 修改密码
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '旧密码和新密码不能为空' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '旧密码不正确' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: '密码格式不正确，请确保长度至少为6位' });
    }
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: '账户已被禁用，请联系管理员' });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        department: user.department,
        position: user.position,
        roles: user.roles,
        permissions: user.permissions,
        phone: user.phone,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新用户个人信息
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    if (req.user.id !== userId && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: '没有权限修改此用户信息' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (name) user.name = name;
    if (email) {
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: '邮箱已被使用' });
        }
      }
      user.email = email;
    }
    if (phone) user.phone = phone;

    if (req.file) {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarPath;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: '个人信息更新成功',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        roles: updatedUser.roles,
        department: updatedUser.department,
        position: updatedUser.position,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('更新个人信息错误:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: '数据验证失败', errors: error.errors });
    }
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '头像文件过大，最大允许5MB' });
        }
        return res.status(400).json({ message: `Multer错误: ${error.message}` });
    }
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getCurrentUser: exports.getCurrentUser,
  updatePassword: exports.updatePassword,
  uploadAvatar: exports.uploadAvatar,
  uploadMiddleware: exports.uploadMiddleware,
  updateProfile: exports.updateProfile
};