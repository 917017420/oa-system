const User = require('../models/User');
const GameAppointment = require('../models/GameAppointment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置头像上传存储
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/avatars');
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名: 用户ID + 时间戳 + 原始扩展名
    const userId = req.user._id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${ext}`);
  }
});

// 头像上传过滤器
const avatarFilter = (req, file, cb) => {
  // 只允许上传图片文件
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传JPG或PNG格式的图片'), false);
  }
};

// 配置头像上传
const uploadAvatarConfig = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制文件大小为2MB
  },
  fileFilter: avatarFilter
});

// 获取用户列表
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      code: 200,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取用户列表失败' 
    });
  }
};

// 获取用户详情
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        code: 404,
        message: '用户不存在' 
      });
    }

    // 获取用户的预约统计
    const createdCount = await GameAppointment.countDocuments({ creator: id });
    const participatedCount = await GameAppointment.countDocuments({ participants: id });

    res.json({
      code: 200,
      user,
      stats: {
        createdAppointments: createdCount,
        participatedAppointments: participatedCount
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取用户详情失败' 
    });
  }
};

// 更新用户信息
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email } = req.body;

    // 验证必填字段
    if (!username && !email) {
      return res.status(400).json({ 
        code: 400,
        message: '请提供要更新的字段' 
      });
    }

    const updateData = {};
    
    if (username) {
      // 检查用户名是否已被其他用户使用
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          code: 400,
          message: '用户名已被使用' 
        });
      }
      
      updateData.username = username;
    }

    if (email) {
      // 检查邮箱是否已被其他用户使用
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          code: 400,
          message: '邮箱已被使用' 
        });
      }
      
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      code: 200,
      message: '用户信息更新成功',
      user: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        code: 400,
        message: '验证失败', 
        errors: messages 
      });
    }

    res.status(500).json({ 
      code: 500,
      message: '服务器错误，更新用户信息失败' 
    });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        code: 400,
        message: '请提供当前密码和新密码' 
      });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        code: 400,
        message: '新密码至少6个字符' 
      });
    }

    // 获取用户（包含密码）
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        code: 404,
        message: '用户不存在' 
      });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        code: 400,
        message: '当前密码错误' 
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({ 
      code: 200,
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，修改密码失败' 
    });
  }
};

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({ 
        code: 400,
        message: '请选择要上传的头像文件' 
      });
    }

    // 构建头像文件路径
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    // 更新用户头像
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        code: 404,
        message: '用户不存在' 
      });
    }

    res.json({
      code: 200,
      message: '头像上传成功',
      user: updatedUser,
      avatar: avatarPath
    });
  } catch (error) {
    console.error('上传头像错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，上传头像失败' 
    });
  }
};

// 获取用户统计信息
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 获取用户创建的预约数量
    const createdCount = await GameAppointment.countDocuments({ creator: userId });
    
    // 获取用户参与的预约数量
    const participatedCount = await GameAppointment.countDocuments({ participants: userId });
    
    // 获取即将到来的预约数量
    const upcomingCount = await GameAppointment.countDocuments({
      participants: userId,
      time: { $gt: new Date() }
    });

    // 获取最近的预约
    const recentAppointments = await GameAppointment.find({
      participants: userId,
      time: { $gt: new Date() }
    })
    .populate('creator', 'username')
    .sort({ time: 1 })
    .limit(5);

    res.json({
      code: 200,
      stats: {
        createdAppointments: createdCount,
        participatedAppointments: participatedCount,
        upcomingAppointments: upcomingCount
      },
      recentAppointments
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取用户统计失败' 
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  getUserStats,
  uploadAvatar,
  uploadAvatarConfig
};