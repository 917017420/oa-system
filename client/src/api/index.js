import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { data } = response
    
    // 检查返回的code字段
    if (data.code && data.code !== 200) {
      // 根据code值处理不同的错误状态
      const userStore = useUserStore()
      
      switch (data.code) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error(data.message || '登录已过期，请重新登录')
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error(data.message || '没有权限访问')
          break
        case 404:
          ElMessage.error(data.message || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(data.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    // 请求成功，返回数据
    return data
  },
  (error) => {
    const userStore = useUserStore()
    
    if (error.response) {
      const { status, data } = error.response
      
      // 如果响应中有code字段，优先使用code处理
      if (data && data.code) {
        switch (data.code) {
          case 400:
            ElMessage.error(data.message || '请求参数错误')
            break
          case 401:
            ElMessage.error(data.message || '登录已过期，请重新登录')
            userStore.logout()
            router.push('/login')
            break
          case 403:
            ElMessage.error(data.message || '没有权限访问')
            break
          case 404:
            ElMessage.error(data.message || '请求的资源不存在')
            break
          case 500:
            ElMessage.error(data.message || '服务器内部错误')
            break
          default:
            ElMessage.error(data.message || '请求失败')
        }
      } else {
        // 兜底处理，使用HTTP状态码
        switch (status) {
          case 401:
            ElMessage.error('登录已过期，请重新登录')
            userStore.logout()
            router.push('/login')
            break
          case 403:
            ElMessage.error('没有权限访问')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器内部错误')
            break
          default:
            ElMessage.error(data?.message || '请求失败')
        }
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default api