import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user,
    hasRole: (state) => (role) => state.roles.includes(role),
    hasPermission: (state) => (permission) => {
      // 管理员拥有所有权限
      if (state.roles.includes('admin')) return true
      return state.permissions.includes(permission)
    }
  },
  
  actions: {
    // 从本地存储初始化用户信息
    initUserFromStorage() {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const roles = JSON.parse(localStorage.getItem('roles') || '[]')
      const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
      
      if (token) {
        this.setUserData({ token, user, roles, permissions })
        // 设置 axios 默认请求头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    },
    
    // 设置用户数据
    setUserData({ token, user, roles, permissions }) {
      this.token = token
      this.user = user
      this.roles = roles
      this.permissions = permissions
      
      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('roles', JSON.stringify(roles))
      localStorage.setItem('permissions', JSON.stringify(permissions))
      
      // 设置 axios 默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    
    // 用户登录
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { token, user } = response.data
        
        this.setUserData({
          token,
          user,
          roles: user.roles,
          permissions: user.permissions
        })
        
        return { success: true }
      } catch (error) {
        console.error('登录失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '登录失败，请稍后重试'
        }
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await axios.get('/api/auth/me')
        const { user } = response.data
        
        this.user = user
        this.roles = user.roles
        this.permissions = user.permissions
        
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('roles', JSON.stringify(user.roles))
        localStorage.setItem('permissions', JSON.stringify(user.permissions))
        
        return { success: true, user }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '获取用户信息失败'
        }
      }
    },
    
    // 用户注销
    logout() {
      // 清除状态
      this.token = ''
      this.user = null
      this.roles = []
      this.permissions = []
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
      localStorage.removeItem('permissions')
      
      // 清除请求头
      delete axios.defaults.headers.common['Authorization']
      
      // 重定向到登录页
      router.push('/login')
    }
  }
})