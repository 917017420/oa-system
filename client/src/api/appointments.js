import api from './index'

// 创建预约
export const createAppointment = (appointmentData) => {
  return api.post('/appointments', appointmentData)
}

// 获取所有预约
export const getAllAppointments = (params) => {
  return api.get('/appointments', { params })
}

// 获取预约详情
export const getAppointmentById = (id) => {
  return api.get(`/appointments/${id}`)
}

// 加入预约
export const joinAppointment = (id) => {
  return api.post(`/appointments/${id}/join`)
}

// 退出预约
export const leaveAppointment = (id) => {
  return api.post(`/appointments/${id}/leave`)
}

// 获取我的预约
export const getMyAppointments = (params) => {
  return api.get('/appointments/my', { params })
}

// 删除预约
export const deleteAppointment = (id) => {
  return api.delete(`/appointments/${id}`)
}