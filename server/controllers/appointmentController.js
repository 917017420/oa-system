const GameAppointment = require('../models/GameAppointment');
const mongoose = require('mongoose');

// 创建游戏预约
const createAppointment = async (req, res) => {
  try {
    const { game, time, description } = req.body;
    const creator = req.user._id;

    // 验证必填字段
    if (!game || !time) {
      return res.status(400).json({ 
        code: 400,
        message: '游戏名称和预约时间是必填项' 
      });
    }

    // 验证时间格式
    const appointmentTime = new Date(time);
    if (isNaN(appointmentTime.getTime())) {
      return res.status(400).json({ 
        code: 400,
        message: '无效的时间格式' 
      });
    }

    // 验证时间是否为未来时间
    if (appointmentTime <= new Date()) {
      return res.status(400).json({ 
        code: 400,
        message: '预约时间必须是未来时间' 
      });
    }

    // 创建预约
    const appointment = new GameAppointment({
      game,
      time: appointmentTime,
      description: description || '',
      creator
    });

    await appointment.save();
    
    // 填充创建者和参与者信息
    await appointment.populate('creator', 'username email');
    await appointment.populate('participants', 'username email');

    res.status(201).json({
      code: 200,
      message: '预约创建成功',
      appointment
    });
  } catch (error) {
    console.error('创建预约错误:', error);
    
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
      message: '服务器错误，创建预约失败' 
    });
  }
};

// 获取所有预约列表
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, game, upcoming } = req.query;
    
    // 构建查询条件
    const query = {};
    
    // 按游戏名筛选
    if (game) {
      query.game = { $regex: game, $options: 'i' };
    }
    
    // 只显示未来的预约
    if (upcoming === 'true') {
      query.time = { $gt: new Date() };
    }

    const appointments = await GameAppointment.find(query)
      .populate('creator', 'username email')
      .populate('participants', 'username email')
      .sort({ time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GameAppointment.countDocuments(query);

    res.json({
      code: 200,
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('获取预约列表错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取预约列表失败' 
    });
  }
};

// 获取预约详情
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        code: 400,
        message: '无效的预约ID' 
      });
    }

    const appointment = await GameAppointment.findById(id)
      .populate('creator', 'username email')
      .populate('participants', 'username email');

    if (!appointment) {
      return res.status(404).json({ 
        code: 404,
        message: '预约不存在' 
      });
    }

    res.json({ 
      code: 200,
      appointment 
    });
  } catch (error) {
    console.error('获取预约详情错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取预约详情失败' 
    });
  }
};

// 加入预约
const joinAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        code: 400,
        message: '无效的预约ID' 
      });
    }

    const appointment = await GameAppointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        code: 404,
        message: '预约不存在' 
      });
    }

    // 检查预约时间是否已过
    if (appointment.time <= new Date()) {
      return res.status(400).json({ 
        code: 400,
        message: '无法加入已过期的预约' 
      });
    }

    // 检查用户是否已经参与
    if (appointment.hasParticipant(userId)) {
      return res.status(400).json({ 
        code: 400,
        message: '您已经参与了此预约' 
      });
    }

    // 添加参与者
    await appointment.addParticipant(userId);
    
    // 重新获取并填充数据
    const updatedAppointment = await GameAppointment.findById(id)
      .populate('creator', 'username email')
      .populate('participants', 'username email');

    res.json({
      code: 200,
      message: '成功加入预约',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('加入预约错误:', error);
    
    if (error.message === '用户已经参与了此预约') {
      return res.status(400).json({ 
        code: 400,
        message: error.message 
      });
    }

    res.status(500).json({ 
      code: 500,
      message: '服务器错误，加入预约失败' 
    });
  }
};

// 退出预约
const leaveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        code: 400,
        message: '无效的预约ID' 
      });
    }

    const appointment = await GameAppointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        code: 404,
        message: '预约不存在' 
      });
    }

    // 检查用户是否参与了此预约
    if (!appointment.hasParticipant(userId)) {
      return res.status(400).json({ 
        code: 400,
        message: '您未参与此预约' 
      });
    }

    // 移除参与者
    await appointment.removeParticipant(userId);
    
    // 重新获取并填充数据
    const updatedAppointment = await GameAppointment.findById(id)
      .populate('creator', 'username email')
      .populate('participants', 'username email');

    res.json({
      code: 200,
      message: '成功退出预约',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('退出预约错误:', error);
    
    if (error.message === '用户未参与此预约') {
      return res.status(400).json({ 
        code: 400,
        message: error.message 
      });
    }

    res.status(500).json({ 
      code: 500,
      message: '服务器错误，退出预约失败' 
    });
  }
};

// 获取我的预约（参与的和创建的）
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all' } = req.query; // all, created, joined

    let appointments;

    switch (type) {
      case 'created':
        appointments = await GameAppointment.findByCreator(userId);
        break;
      case 'joined':
        appointments = await GameAppointment.findByParticipant(userId);
        break;
      default:
        // 获取用户参与的所有预约（包括创建的）
        appointments = await GameAppointment.find({
          participants: userId
        })
        .populate('creator', 'username email')
        .populate('participants', 'username email')
        .sort({ time: 1 });
    }

    res.json({ 
      code: 200,
      appointments 
    });
  } catch (error) {
    console.error('获取我的预约错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，获取我的预约失败' 
    });
  }
};

// 删除预约（仅创建者可删除）
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 验证ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        code: 400,
        message: '无效的预约ID' 
      });
    }

    const appointment = await GameAppointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        code: 404,
        message: '预约不存在' 
      });
    }

    // 检查是否为创建者
    if (appointment.creator.toString() !== userId.toString()) {
      return res.status(403).json({ 
        code: 403,
        message: '只有创建者可以删除预约' 
      });
    }

    await GameAppointment.findByIdAndDelete(id);

    res.json({ 
      code: 200,
      message: '预约删除成功' 
    });
  } catch (error) {
    console.error('删除预约错误:', error);
    res.status(500).json({ 
      code: 500,
      message: '服务器错误，删除预约失败' 
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  joinAppointment,
  leaveAppointment,
  getMyAppointments,
  deleteAppointment
};