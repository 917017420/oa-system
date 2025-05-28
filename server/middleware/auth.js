const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT认证中间件
const auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '访问被拒绝，未提供认证令牌' });
    }

    // 检查token格式 (Bearer <token>)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ code: 401, message: '访问被拒绝，令牌格式错误' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '令牌无效，用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT认证错误:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: '令牌无效' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '令牌已过期' });
    }
    
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 可选认证中间件（用户可能登录也可能未登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    req.user = user || null;
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，只是设置user为null
    req.user = null;
    next();
  }
};

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = {
  auth,
  optionalAuth,
  generateToken
};