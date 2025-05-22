const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由中间件 - 验证JWT令牌
exports.protect = async (req, res, next) => {
  let token;

  // 从请求头中获取令牌
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 检查令牌是否存在
  if (!token) {
    return res.status(401).json({ message: '未授权，无访问令牌' });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 获取用户信息
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: '令牌无效，用户不存在' });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ message: '账户已被禁用，请联系管理员' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('令牌验证错误:', error);
    return res.status(401).json({ message: '未授权，令牌无效' });
  }
};

// 角色授权中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }

    // 检查用户角色
    const hasRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: '禁止访问，权限不足' });
    }

    next();
  };
};

// 权限检查中间件
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }

    // 管理员拥有所有权限
    if (req.user.roles.includes('admin')) {
      return next();
    }

    // 检查用户权限
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: '禁止访问，权限不足' });
    }

    next();
  };
};