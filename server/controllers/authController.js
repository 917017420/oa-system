const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ 
        code: 400,
        message: '请提供用户名、邮箱和密码' 
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        code: 400,
        message: '用户名已存在' 
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        code: 400,
        message: '邮箱已被注册' 
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // 生成JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      code: 200,
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    
    // 处理Mongoose验证错误
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
      message: '服务器错误，注册失败' 
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ 
        code: 400,
        message: '请提供邮箱和密码' 
      });
    }

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        code: 401,
        message: '邮箱或密码错误' 
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        code: 401,
        message: '邮箱或密码错误' 
      });
    }

    // 生成JWT token
    const token = generateToken(user._id);

    res.json({
      code: 200,
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，登录失败' 
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    // req.user 由认证中间件设置
    const user = req.user;
    
    res.json({
      code: 200,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取用户信息失败' 
    });
  }
};

// 验证token有效性
const verifyToken = async (req, res) => {
  try {
    // 如果能到达这里，说明token有效（通过了auth中间件）
    res.json({
      code: 200,
      valid: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('验证token错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误' 
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  verifyToken
};