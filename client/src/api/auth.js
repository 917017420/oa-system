import api from './index'

// 用户注册
export const register = (userData) => {
  return api.post('/auth/register', userData)
}

// 用户登录
export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get('/auth/me')
}

// 验证token
export const verifyToken = () => {
  return api.get('/auth/verify')
}

// 获取用户列表
export const getUsers = (params) => {
  return api.get('/users', { params })
}

// 获取用户详情
export const getUserById = (id) => {
  return api.get(`/users/${id}`)
}

// 更新用户信息
export const updateProfile = (userData) => {
  return api.put('/users/profile', userData)
}

// 修改密码
export const changePassword = (passwordData) => {
  return api.put('/users/password', passwordData)
}

// 获取用户统计信息
export const getUserStats = () => {
  return api.get('/users/stats')
}

// 上传头像
export const uploadAvatar = (formData) => {
  return api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}