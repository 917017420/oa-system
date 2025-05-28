import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  joinAppointment,
  leaveAppointment,
  getMyAppointments,
  deleteAppointment
} from '@/api/appointments'
import { ElMessage } from 'element-plus'

export const useAppointmentsStore = defineStore('appointments', () => {
  // 状态
  const appointments = ref([])
  const currentAppointment = ref(null)
  const myAppointments = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 计算属性
  const upcomingAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(appointment => new Date(appointment.time) > now)
  })

  const pastAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(appointment => new Date(appointment.time) <= now)
  })

  // 获取所有预约
  const fetchAppointments = async (params = {}) => {
    try {
      loading.value = true
      const response = await getAllAppointments(params)
      
      if (response.code === 200) {
        appointments.value = response.appointments
        pagination.value = {
          page: parseInt(response.currentPage),
          limit: params.limit || 10,
          total: response.total,
          totalPages: response.totalPages
        }
        return { success: true, data: response }
      } else {
        ElMessage.error(response.message || '获取预约列表失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '获取预约列表失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 获取预约详情
  const fetchAppointmentById = async (id) => {
    try {
      loading.value = true
      const response = await getAppointmentById(id)
      
      if (response.code === 200) {
        currentAppointment.value = response.appointment
        return { success: true, appointment: response.appointment }
      } else {
        ElMessage.error(response.message || '获取预约详情失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '获取预约详情失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 创建预约
  const createNewAppointment = async (appointmentData) => {
    try {
      loading.value = true
      const response = await createAppointment(appointmentData)
      
      if (response.code === 200) {
        ElMessage.success(response.message || '预约创建成功')
        // 刷新预约列表
        await fetchAppointments()
        return { success: true, appointment: response.appointment }
      } else {
        ElMessage.error(response.message || '创建预约失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '创建预约失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 加入预约
  const joinAppointmentById = async (id) => {
    try {
      loading.value = true
      const response = await joinAppointment(id)
      
      if (response.code === 200) {
        ElMessage.success(response.message || '成功加入预约')
        // 更新当前预约信息
        if (currentAppointment.value && currentAppointment.value._id === id) {
          await fetchAppointmentById(id)
        }
        // 刷新预约列表
        await fetchAppointments()
        return { success: true }
      } else {
        ElMessage.error(response.message || '加入预约失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '加入预约失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 退出预约
  const leaveAppointmentById = async (id) => {
    try {
      loading.value = true
      const response = await leaveAppointment(id)
      
      if (response.code === 200) {
        ElMessage.success(response.message || '成功退出预约')
        // 更新当前预约信息
        if (currentAppointment.value && currentAppointment.value._id === id) {
          await fetchAppointmentById(id)
        }
        // 刷新预约列表
        await fetchAppointments()
        return { success: true }
      } else {
        ElMessage.error(response.message || '退出预约失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '退出预约失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 获取我的预约
  const fetchMyAppointments = async (params = {}) => {
    try {
      loading.value = true
      const response = await getMyAppointments(params)
      
      if (response.code === 200) {
        myAppointments.value = response.appointments
        return { success: true, data: response }
      } else {
        ElMessage.error(response.message || '获取我的预约失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '获取我的预约失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 删除预约
  const deleteAppointmentById = async (id) => {
    try {
      loading.value = true
      const response = await deleteAppointment(id)
      
      if (response.code === 200) {
        ElMessage.success(response.message || '预约删除成功')
        // 刷新预约列表
        await fetchAppointments()
        return { success: true }
      } else {
        ElMessage.error(response.message || '删除预约失败')
        return { success: false }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '删除预约失败'
      ElMessage.error(message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // 清空当前预约
  const clearCurrentAppointment = () => {
    currentAppointment.value = null
  }

  return {
    // 状态
    appointments,
    currentAppointment,
    myAppointments,
    loading,
    pagination,
    // 计算属性
    upcomingAppointments,
    pastAppointments,
    // 方法
    fetchAppointments,
    fetchAppointmentById,
    createNewAppointment,
    joinAppointmentById,
    leaveAppointmentById,
    fetchMyAppointments,
    deleteAppointmentById,
    clearCurrentAppointment
  }
})