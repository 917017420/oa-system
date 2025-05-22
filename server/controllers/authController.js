const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ message: '账户已被禁用，请联系管理员' });
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 生成JWT令牌
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