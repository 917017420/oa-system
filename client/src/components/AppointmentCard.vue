<template>
  <div class="appointment-card" @click="$emit('click')">
    <div class="card-header">
      <div class="game-info">
        <el-icon class="game-icon"><Monitor /></el-icon>
        <span class="game-name">{{ appointment.game }}</span>
      </div>
      <el-tag :type="getStatusType(appointment.time)" size="small">
        {{ getStatusText(appointment.time) }}
      </el-tag>
    </div>
    
    <div class="card-body">
      <div class="time-info">
        <el-icon><Clock /></el-icon>
        <span>{{ formatTime(appointment.time) }}</span>
      </div>
      
      <div class="creator-info">
        <el-icon><User /></el-icon>
        <span>发起人：{{ appointment.creator?.username || '未知' }}</span>
      </div>
      
      <div class="participants-info">
        <el-icon><UserFilled /></el-icon>
        <span>参与人数：{{ appointment.participants?.length || 0 }}</span>
      </div>
      
      <div v-if="appointment.description" class="description">
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ appointment.description }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="participants-avatars">
        <el-avatar-group :max="4" size="small">
          <el-avatar 
            v-for="participant in appointment.participants" 
            :key="participant._id"
            size="small"
          >
            {{ participant.username?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
        </el-avatar-group>
      </div>
      
      <div class="card-actions">
        <el-button type="primary" size="small" plain>
          查看详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Monitor,
  Clock,
  User,
  UserFilled,
  ChatDotRound
} from '@element-plus/icons-vue'

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const timeStr = date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `明天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays}天后 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return timeStr
  }
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
</script>

<style scoped>
.appointment-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.game-icon {
  font-size: 20px;
  color: #409eff;
}

.game-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  margin-bottom: 16px;
}

.time-info,
.creator-info,
.participants-info,
.description {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.time-info {
  color: #409eff;
  font-weight: 500;
}

.description {
  margin-bottom: 0;
}

.description span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.participants-avatars {
  flex: 1;
}

.card-actions {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .appointment-card {
    padding: 16px;
  }
  
  .game-name {
    font-size: 16px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .card-actions {
    text-align: center;
  }
}
</style>