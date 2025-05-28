import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getCurrentUser, verifyToken, updateProfile as updateProfileAPI, changePassword as changePasswordAPI, getUserStats as getUserStatsAPI, uploadAvatar } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
  }

  // 用户登录
  const userLogin = async (credentials) => {
    try {
      loading.value = true
      const response = await login(credentials)
      
      if (response.code === 200) {
        setToken(response.token)
        setUser(response.user)
        ElMessage.success(response.message || '登录成功')
        return { success: true }
      } else {
        ElMessage.error(response.message || '登录失败')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '登录失败'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const userRegister = async (userData) => {
    try {
      loading.value = true
      const response = await register(userData)
      
      if (response.code === 200) {
        setToken(response.token)
        setUser(response.user)
        ElMessage.success(response.message || '注册成功')
        return { success: true }
      } else {
        ElMessage.error(response.message || '注册失败')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '注册失败'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      if (!token.value) return false
      
      const response = await getCurrentUser()
      if (response.code === 200) {
        setUser(response.user)
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  // 验证token有效性
  const checkToken = async () => {
    try {
      if (!token.value) return false
      
      const response = await verifyToken()
      if (response.code === 200) {
        setUser(response.user)
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  // 用户登出
  const logout = () => {
    setToken('')
    setUser(null)
    ElMessage.success('已退出登录')
  }

  // 更新个人资料
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await updateProfileAPI(profileData)
      
      if (response.code === 200) {
        setUser(response.user)
        ElMessage.success(response.message || '个人资料更新成功')
        return { success: true }
      } else {
        ElMessage.error(response.message || '更新失败')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '更新失败'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      const response = await changePasswordAPI(passwordData)
      
      if (response.code === 200) {
        ElMessage.success(response.message || '密码修改成功')
        return { success: true }
      } else {
        ElMessage.error(response.message || '密码修改失败')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '密码修改失败'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 获取用户统计数据
  const getUserStats = async () => {
    try {
      const response = await getUserStatsAPI()
      
      if (response.code === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '获取统计数据失败'
      return { success: false, message }
    }
  }

  // 初始化用户状态
  const initUser = async () => {
    if (token.value) {
      await checkToken()
    }
  }

  // 上传头像
  const uploadUserAvatar = async (formData) => {
    try {
      loading.value = true
      const response = await uploadAvatar(formData)
      
      if (response.code === 200) {
        // 更新用户头像信息
        if (user.value) {
          user.value.avatar = response.data.avatarUrl
        }
        return { success: true, data: response.data }
      } else {
        ElMessage.error(response.message || '头像上传失败')
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '头像上传失败'
      ElMessage.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    token,
    user,
    loading,
    // 计算属性
    isLoggedIn,
    userName,
    userEmail,
    // 方法
    setToken,
    setUser,
    userLogin,
    userRegister,
    fetchUserInfo,
    checkToken,
    logout,
    initUser,
    updateProfile,
    changePassword,
    getUserStats,
    uploadUserAvatar
  }
})