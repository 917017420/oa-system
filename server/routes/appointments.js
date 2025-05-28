const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  joinAppointment,
  leaveAppointment,
  getMyAppointments,
  deleteAppointment
} = require('../controllers/appointmentController');

// @route   POST /api/appointments
// @desc    创建游戏预约
// @access  Private
router.post('/', auth, createAppointment);

// @route   GET /api/appointments
// @desc    获取所有预约列表
// @access  Public (可选认证，用于显示是否已参与)
router.get('/', optionalAuth, getAllAppointments);

// @route   GET /api/appointments/my
// @desc    获取我的预约
// @access  Private
router.get('/my', auth, getMyAppointments);

// @route   GET /api/appointments/:id
// @desc    获取预约详情
// @access  Public (可选认证，用于显示是否已参与)
router.get('/:id', optionalAuth, getAppointmentById);

// @route   POST /api/appointments/:id/join
// @desc    加入预约
// @access  Private
router.post('/:id/join', auth, joinAppointment);

// @route   POST /api/appointments/:id/leave
// @desc    退出预约
// @access  Private
router.post('/:id/leave', auth, leaveAppointment);

// @route   DELETE /api/appointments/:id
// @desc    删除预约（仅创建者）
// @access  Private
router.delete('/:id', auth, deleteAppointment);

module.exports = router;