const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false // 修改为可选
  },
  email: {
    type: String,
    required: false, // 修改为可选
    unique: true,
    trim: true,
    lowercase: true,
    // 添加sparse:true以允许null值不参与唯一性索引，如果需要邮箱仍然唯一（当提供时）
    // sparse: true 
  },
  department: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  roles: [{
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  }],
  permissions: [{
    type: String
  }],
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);