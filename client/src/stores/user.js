import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import axios from 'axios'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: Cookies.get('token') || '',
    user: JSON.parse(Cookies.get('user') || 'null'),
    roles: JSON.parse(Cookies.get('roles') || '[]'),
    permissions: JSON.parse(Cookies.get('permissions') || '[]')
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
    // 从 Cookies 初始化用户信息
    initUserFromStorage() {
      const token = Cookies.get('token');
      const user = JSON.parse(Cookies.get('user') || 'null');
      const roles = JSON.parse(Cookies.get('roles') || '[]');
      const permissions = JSON.parse(Cookies.get('permissions') || '[]');
      
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
      
      // 保存到 Cookies，设置1小时过期
      const expires = new Date(new Date().getTime() + 60 * 60 * 1000);
      Cookies.set('token', token, { expires });
      Cookies.set('user', JSON.stringify(user), { expires });
      Cookies.set('roles', JSON.stringify(roles), { expires });
      Cookies.set('permissions', JSON.stringify(permissions), { expires });
      
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
        
        const expires = new Date(new Date().getTime() + 60 * 60 * 1000);
        Cookies.set('user', JSON.stringify(user), { expires });
        Cookies.set('roles', JSON.stringify(user.roles), { expires });
        Cookies.set('permissions', JSON.stringify(user.permissions), { expires });
        
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
      
      // 清除 Cookies
      Cookies.remove('token');
      Cookies.remove('user');
      Cookies.remove('roles');
      Cookies.remove('permissions');
      
      // 清除请求头
      delete axios.defaults.headers.common['Authorization']
      
      // 重定向到登录页
      router.push('/login')
    },
    updateUserAvatar(avatarUrl) {
      if (this.user) {
        this.user.avatar = avatarUrl;
        const expires = new Date(new Date().getTime() + 60 * 60 * 1000);
        Cookies.set('user', JSON.stringify(this.user), { expires });
      }
    }
  }
})