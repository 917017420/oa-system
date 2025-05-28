const mongoose = require('mongoose');

const gameAppointmentSchema = new mongoose.Schema({
  game: {
    type: String,
    required: [true, '游戏名称是必填项'],
    trim: true,
    maxlength: [50, '游戏名称最多50个字符']
  },
  time: {
    type: Date,
    required: [true, '预约时间是必填项'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: '预约时间必须是未来时间'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '备注最多500个字符'],
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '创建者是必填项']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建预约时自动将创建者加入参与者列表
gameAppointmentSchema.pre('save', function(next) {
  if (this.isNew && !this.participants.includes(this.creator)) {
    this.participants.push(this.creator);
  }
  next();
});

// 添加索引以提高查询性能
gameAppointmentSchema.index({ time: 1 });
gameAppointmentSchema.index({ creator: 1 });
gameAppointmentSchema.index({ participants: 1 });

// 静态方法：获取用户参与的所有预约
gameAppointmentSchema.statics.findByParticipant = function(userId) {
  return this.find({ participants: userId })
    .populate('creator', 'username email')
    .populate('participants', 'username email')
    .sort({ time: 1 });
};

// 静态方法：获取用户创建的所有预约
gameAppointmentSchema.statics.findByCreator = function(userId) {
  return this.find({ creator: userId })
    .populate('creator', 'username email')
    .populate('participants', 'username email')
    .sort({ time: 1 });
};

// 实例方法：检查用户是否已参与此预约
gameAppointmentSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// 实例方法：添加参与者
gameAppointmentSchema.methods.addParticipant = function(userId) {
  if (!this.hasParticipant(userId)) {
    this.participants.push(userId);
    return this.save();
  }
  throw new Error('用户已经参与了此预约');
};

// 实例方法：移除参与者
gameAppointmentSchema.methods.removeParticipant = function(userId) {
  if (this.hasParticipant(userId)) {
    this.participants = this.participants.filter(participant => 
      participant.toString() !== userId.toString()
    );
    return this.save();
  }
  throw new Error('用户未参与此预约');
};

module.exports = mongoose.model('GameAppointment', gameAppointmentSchema);