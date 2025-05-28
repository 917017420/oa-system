<template>
  <div class="appointment-detail-view">
    <div class="page-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
      
      <!-- 预约详情 -->
      <div v-else-if="appointment" class="appointment-detail">
        <!-- 头部信息 -->
        <div class="detail-header">
          <div class="header-content">
            <div class="game-info">
              <el-icon class="game-icon"><Monitor /></el-icon>
              <div>
                <h1 class="game-title">{{ appointment.game }}</h1>
                <div class="status-info">
                  <el-tag :type="getStatusType(appointment.time)" size="large">
                    {{ getStatusText(appointment.time) }}
                  </el-tag>
                  <span class="time-text">{{ formatTime(appointment.time) }}</span>
                </div>
              </div>
            </div>
            
            <div class="header-actions">
              <el-button 
                v-if="canJoin" 
                type="primary" 
                :loading="actionLoading" 
                @click="handleJoin"
              >
                加入预约
              </el-button>
              <el-button 
                v-else-if="canLeave" 
                type="warning" 
                :loading="actionLoading" 
                @click="handleLeave"
              >
                退出预约
              </el-button>
              <el-button 
                v-if="canDelete" 
                type="danger" 
                :loading="actionLoading" 
                @click="handleDelete"
              >
                删除预约
              </el-button>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <el-row :gutter="24">
          <!-- 左侧信息 -->
          <el-col :xs="24" :lg="16">
            <div class="info-card">
              <h3 class="card-title">预约信息</h3>
              <div class="info-list">
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span class="label">预约时间：</span>
                  <span class="value">{{ formatFullTime(appointment.time) }}</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span class="label">发起人：</span>
                  <span class="value">{{ appointment.creator?.username || '未知' }}</span>
                </div>
                <div class="info-item">
                  <el-icon><UserFilled /></el-icon>
                  <span class="label">参与人数：</span>
                  <span class="value">{{ appointment.participants?.length || 0 }} 人</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatFullTime(appointment.createdAt) }}</span>
                </div>
              </div>
              
              <div v-if="appointment.description" class="description-section">
                <h4 class="section-title">预约描述</h4>
                <p class="description-text">{{ appointment.description }}</p>
              </div>
            </div>
          </el-col>
          
          <!-- 右侧参与者 -->
          <el-col :xs="24" :lg="8">
            <div class="participants-card">
              <h3 class="card-title">参与者 ({{ appointment.participants?.length || 0 }})</h3>
              <div class="participants-list">
                <div 
                  v-for="participant in appointment.participants" 
                  :key="participant._id"
                  class="participant-item"
                >
                  <el-avatar size="small">
                    {{ participant.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </el-avatar>
                  <span class="participant-name">{{ participant.username }}</span>
                  <el-tag v-if="participant._id === appointment.creator?._id" size="small" type="success">
                    发起人
                  </el-tag>
                </div>
              </div>
              
              <div v-if="!appointment.participants?.length" class="empty-participants">
                <el-empty description="暂无参与者" :image-size="80" />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 错误状态 -->
      <div v-else class="error-container">
        <el-result
          icon="error"
          title="预约不存在"
          sub-title="该预约可能已被删除或不存在"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/appointments')">
              返回预约列表
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppointmentsStore } from '@/stores/appointments'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor,
  Clock,
  User,
  UserFilled,
  Calendar
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appointmentsStore = useAppointmentsStore()

const loading = ref(false)
const actionLoading = ref(false)

// 计算属性
const appointment = computed(() => appointmentsStore.currentAppointment)

// 是否可以加入
const canJoin = computed(() => {
  if (!userStore.isLoggedIn || !appointment.value) return false
  
  const isParticipant = appointment.value.participants?.some(
    p => p._id === userStore.user?._id
  )
  const isPast = new Date(appointment.value.time) < new Date()
  
  return !isParticipant && !isPast
})

// 是否可以退出
const canLeave = computed(() => {
  if (!userStore.isLoggedIn || !appointment.value) return false
  
  const isParticipant = appointment.value.participants?.some(
    p => p._id === userStore.user?._id
  )
  const isCreator = appointment.value.creator?._id === userStore.user?._id
  const isPast = new Date(appointment.value.time) < new Date()
  
  return isParticipant && !isCreator && !isPast
})

// 是否可以删除
const canDelete = computed(() => {
  if (!userStore.isLoggedIn || !appointment.value) return false
  return appointment.value.creator?._id === userStore.user?._id
})

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `明天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays}天后 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleString('zh-CN')
  }
}

// 格式化完整时间
const formatFullTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (time) => {
  const now = new Date()
  const appointmentTime = new Date(time)
  
  if (appointmentTime < now) {
    return 'info'
  } else {
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffHours <= 2) {
      return 'danger'
    } else if (diffHours <= 24) {
      return 'warning'
    } else {
      return 'success'
    }
  }
}

// 获取状态文本
const getStatusText = (time) => {
  const now = new Date()
  const appointmentTime = new Date(time)
  
  if (appointmentTime < now) {
    return '已结束'
  } else {
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffHours <= 2) {
      return '即将开始'
    } else if (diffHours <= 24) {
      return '今日预约'
    } else {
      return '即将到来'
    }
  }
}

// 处理加入预约
const handleJoin = async () => {
  try {
    actionLoading.value = true
    const result = await appointmentsStore.joinAppointmentById(route.params.id)
    if (result.success) {
      // 重新获取预约详情
      await fetchAppointmentDetail()
    }
  } catch (error) {
    console.error('加入预约失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 处理退出预约
const handleLeave = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出这个预约吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    actionLoading.value = true
    const result = await appointmentsStore.leaveAppointmentById(route.params.id)
    if (result.success) {
      // 重新获取预约详情
      await fetchAppointmentDetail()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出预约失败:', error)
    }
  } finally {
    actionLoading.value = false
  }
}

// 处理删除预约
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个预约吗？删除后无法恢复。',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    actionLoading.value = true
    const result = await appointmentsStore.deleteAppointmentById(route.params.id)
    if (result.success) {
      ElMessage.success('预约删除成功')
      router.push('/appointments')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除预约失败:', error)
    }
  } finally {
    actionLoading.value = false
  }
}

// 获取预约详情
const fetchAppointmentDetail = async () => {
  loading.value = true
  try {
    await appointmentsStore.fetchAppointmentById(route.params.id)
  } catch (error) {
    console.error('获取预约详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAppointmentDetail()
})
</script>

<style scoped>
.appointment-detail-view {
  min-height: calc(100vh - 60px);
}

.loading-container,
.error-container {
  padding: 60px 20px;
}

.detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin: -20px -20px 32px -20px;
  border-radius: 0 0 16px 16px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-icon {
  font-size: 48px;
}

.game-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-text {
  font-size: 16px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.info-card,
.participants-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.info-list {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .el-icon {
  color: #409eff;
  font-size: 16px;
  width: 16px;
}

.label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.value {
  color: #303133;
}

.description-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.description-text {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.participants-list {
  max-height: 400px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-name {
  flex: 1;
  color: #303133;
}

.empty-participants {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .game-info {
    flex-direction: column;
    text-align: center;
  }
  
  .game-title {
    font-size: 24px;
  }
  
  .game-icon {
    font-size: 36px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .label {
    min-width: auto;
  }
}
</style>