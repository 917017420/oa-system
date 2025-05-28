<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-background"></div>
      <div class="banner-content">
        <div class="banner-text">
          <h1>欢迎{{ userStore.isLoggedIn ? '回来，' + userStore.user.username : '使用预约系统' }}</h1>
          <p>{{ userStore.isLoggedIn ? '您可以快速创建或加入游戏预约' : '轻松创建和管理您的游戏预约' }}</p>
          
          <div class="banner-actions" v-if="!userStore.isLoggedIn">
            <el-button type="primary" @click="router.push('/login')" :icon="UserFilled">
              登录
            </el-button>
            <el-button @click="router.push('/register')" :icon="Key">
              注册
            </el-button>
          </div>
          
          <div class="banner-actions" v-else>
            <el-button type="primary" @click="showCreateDialog = true" :icon="Plus">
              创建预约
            </el-button>
            <el-button @click="router.push('/appointments')" :icon="Calendar">
              浏览预约
            </el-button>
          </div>
        </div>
        
        <!-- 用户统计卡片 -->
        <div class="user-stats" v-if="userStore.isLoggedIn">
          <el-card class="stats-card">
            <div class="stats-value">{{ userStats.created }}</div>
            <div class="stats-label">我创建的</div>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-value">{{ userStats.joined }}</div>
            <div class="stats-label">我参与的</div>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-value">{{ totalAppointments }}</div>
            <div class="stats-label">总预约数</div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 功能特色 -->
    <div class="features-section">
      <div class="page-container">
        <h2 class="section-title">功能特色</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" class="feature-col">
            <div class="feature-card">
              <div class="feature-icon-container">
                <el-icon class="feature-icon"><Calendar /></el-icon>
              </div>
              <h3>创建预约</h3>
              <p>轻松创建游戏预约，邀请朋友一起参与</p>
              <div class="feature-actions">
                <el-button 
                  v-if="userStore.isLoggedIn" 
                  type="primary" 
                  size="small" 
                  @click="showCreateDialog = true"
                >
                  创建预约
                </el-button>
                <el-button 
                  v-else 
                  type="primary" 
                  size="small" 
                  @click="router.push('/register')"
                >
                  立即注册
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" class="feature-col">
            <div class="feature-card">
              <div class="feature-icon-container">
                <el-icon class="feature-icon"><UserFilled /></el-icon>
              </div>
              <h3>加入预约</h3>
              <p>浏览并加入感兴趣的游戏预约</p>
              <div class="feature-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="router.push('/appointments')"
                >
                  浏览预约
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" class="feature-col">
            <div class="feature-card">
              <div class="feature-icon-container">
                <el-icon class="feature-icon"><ChatDotRound /></el-icon>
              </div>
              <h3>管理预约</h3>
              <p>方便地管理您的所有预约信息</p>
              <div class="feature-actions">
                <el-button 
                  v-if="userStore.isLoggedIn" 
                  type="primary" 
                  size="small" 
                  @click="router.push('/my-appointments')"
                >
                  我的预约
                </el-button>
                <el-button 
                  v-else 
                  type="primary" 
                  size="small" 
                  @click="router.push('/login')"
                >
                  立即登录
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" class="feature-col">
            <div class="feature-card">
              <div class="feature-icon-container">
                <el-icon class="feature-icon"><Bell /></el-icon>
              </div>
              <h3>预约通知</h3>
              <p>及时接收预约提醒和状态更新</p>
              <div class="feature-actions">
                <el-button 
                  v-if="userStore.isLoggedIn" 
                  type="primary" 
                  size="small" 
                  @click="router.push('/profile')"
                >
                  通知设置
                </el-button>
                <el-button 
                  v-else 
                  type="primary" 
                  size="small" 
                  @click="router.push('/register')"
                >
                  立即体验
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 最新预约 -->
    <div class="recent-section">
      <div class="section-header">
        <h2>最新预约</h2>
        <div class="header-actions">
          <el-button 
            :icon="Refresh" 
            :loading="loading" 
            @click="fetchRecentAppointments"
            circle
          />
          <el-button 
            :icon="View" 
            @click="router.push('/appointments')"
            circle
          />
        </div>
      </div>
      
      <div v-loading="loading" class="appointments-grid">
        <div v-if="recentAppointments.length === 0 && !loading" class="empty-state">
          <el-icon class="empty-icon"><Calendar /></el-icon>
          <p>暂无预约</p>
          <el-button type="primary" @click="showCreateDialog = true">
            创建第一个预约
          </el-button>
        </div>
        
        <div 
          v-for="appointment in recentAppointments"
          :key="appointment._id"
          class="appointment-card-wrapper"
          @click="goToDetail(appointment._id)"
        >
          <AppointmentCard :appointment="appointment" />
        </div>
      </div>
      
      <div class="view-more" v-if="recentAppointments.length > 0">
        <el-button @click="router.push('/appointments')">
          查看更多预约
        </el-button>
      </div>
    </div>
    
    <!-- 创建预约弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建游戏预约"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <el-form :model="appointmentForm" label-position="top" :rules="rules" ref="appointmentFormRef">
        <el-form-item label="游戏名称" prop="game">
          <el-input v-model="appointmentForm.game" placeholder="请输入游戏名称" />
        </el-form-item>
        
        <el-form-item label="预约时间" prop="time">
          <el-date-picker
            v-model="appointmentForm.time"
            type="datetime"
            placeholder="选择日期和时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="预约描述" prop="description">
          <el-input
            v-model="appointmentForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入预约描述（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="通知用户" prop="notifyUsers">
          <el-select
            v-model="appointmentForm.notifyUsers"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索"
            :remote-method="searchUsers"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user._id"
              :label="user.username"
              :value="user._id"
            >
              <div style="display: flex; align-items: center;">
                <el-avatar 
                  :size="30" 
                  :src="user.avatar || ''"
                  :icon="UserFilled"
                  style="margin-right: 10px;"
                />
                <span>{{ user.username }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-notice">
            <el-alert
              title="预约须知"
              type="info"
              :closable="false"
              :show-icon="false"
            >
              <template #default>
                <ul class="notice-list">
                  <li>预约时间必须是未来时间</li>
                  <li>创建预约后，你将自动成为参与者</li>
                  <li>其他用户可以加入你的预约</li>
                  <li>你可以随时管理和删除自己创建的预约</li>
                </ul>
              </template>
            </el-alert>
          </div>
          <div class="dialog-actions">
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="submitAppointment" :loading="submitLoading">
              创建预约
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppointmentsStore } from '@/stores/appointments'
import { getUsers } from '@/api/auth'
import AppointmentCard from '@/components/AppointmentCard.vue'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Calendar,
  UserFilled,
  ChatDotRound,
  Bell,
  Plus,
  Key,
  Refresh,
  View
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const appointmentsStore = useAppointmentsStore()

const loading = ref(false)
const recentAppointments = ref([])
const userStats = ref({ created: 0, joined: 0 })
const totalAppointments = ref(0)

// 创建预约弹窗相关
const showCreateDialog = ref(false)
const submitLoading = ref(false)
const searchLoading = ref(false)
const userOptions = ref([])
const appointmentFormRef = ref()

const appointmentForm = reactive({
  game: '',
  time: '',
  description: '',
  notifyUsers: []
})

// 验证预约时间
const validateTime = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择预约时间'))
  } else {
    const selectedTime = new Date(value)
    const now = new Date()
    
    if (selectedTime <= now) {
      callback(new Error('预约时间必须是未来时间'))
    } else {
      callback()
    }
  }
}

const rules = {
  game: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' },
    { min: 1, max: 50, message: '游戏名称长度在1到50个字符', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择预约时间', trigger: 'change' },
    { validator: validateTime, trigger: 'change' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 获取最新预约
const fetchRecentAppointments = async () => {
  loading.value = true
  try {
    const result = await appointmentsStore.fetchAppointments({ 
      page: 1, 
      limit: 6,
      upcoming: true 
    })
    if (result.success) {
      recentAppointments.value = appointmentsStore.appointments
      totalAppointments.value = result.data.total || 0
    }
  } catch (error) {
    console.error('获取最新预约失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取用户统计数据
const fetchUserStats = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    // 获取我创建的预约数量
    const createdResult = await appointmentsStore.fetchAppointments({
      creator: userStore.user._id,
      limit: 1
    })
    
    if (createdResult.success) {
      userStats.value.created = createdResult.data.total || 0
    }
    
    // 获取我参与的预约数量
    const joinedResult = await appointmentsStore.fetchAppointments({
      participant: userStore.user._id,
      limit: 1
    })
    
    if (joinedResult.success) {
      userStats.value.joined = joinedResult.data.total || 0
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  }
}

// 搜索用户
const searchUsers = async (query) => {
  if (query.length < 2) {
    userOptions.value = []
    return
  }
  
  searchLoading.value = true
  try {
    const response = await getUsers({ search: query, limit: 20 })
    
    if (response.code === 200) {
      // 排除当前用户
      userOptions.value = response.users.filter(user => 
        user._id !== userStore.user._id
      )
    } else {
      userOptions.value = []
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    userOptions.value = []
  } finally {
    searchLoading.value = false
  }
}

// 提交预约表单
const submitAppointment = async () => {
  if (!appointmentFormRef.value) return
  
  try {
    await appointmentFormRef.value.validate()
    
    submitLoading.value = true
    const result = await appointmentsStore.createNewAppointment(appointmentForm)
    
    if (result.success) {
      ElMessage.success('预约创建成功')
      showCreateDialog.value = false
      // 重置表单
      appointmentForm.game = ''
      appointmentForm.time = ''
      appointmentForm.description = ''
      appointmentForm.notifyUsers = []
      // 刷新预约列表
      fetchRecentAppointments()
      // 刷新用户统计
      fetchUserStats()
    }
  } catch (error) {
    console.error('创建预约失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 跳转到预约详情
const goToDetail = (id) => {
  router.push(`/appointments/${id}`)
}

onMounted(() => {
  fetchRecentAppointments()
  if (userStore.isLoggedIn) {
    fetchUserStats()
  }
})
</script>

<style scoped>
.home-container {
  padding-bottom: 40px;
}

/* 欢迎横幅 */
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
  overflow: hidden;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="none" width="100" height="100"/><rect fill="rgba(255,255,255,0.05)" width="50" height="50"/><rect fill="rgba(255,255,255,0.05)" x="50" y="50" width="50" height="50"/></svg>');
  opacity: 0.3;
  z-index: 1;
}

.banner-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.banner-text {
  flex: 1;
  min-width: 300px;
  margin-right: 20px;
}

.banner-text h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.banner-text p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.user-stats {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.stats-card {
  padding: 15px;
  text-align: center;
  min-width: 100px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  backdrop-filter: blur(5px);
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 功能特色 */
.features-section {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
  font-weight: 600;
}

.feature-col {
  margin-bottom: 30px;
}

.feature-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon-container {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  border-radius: 50%;
}

.feature-icon {
  font-size: 2rem;
  color: #409EFF;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  margin-bottom: 20px;
  flex-grow: 1;
}

.feature-actions {
  margin-top: auto;
}

/* 最新预约 */
.recent-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  min-height: 200px;
}

.appointment-card-wrapper {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.appointment-card-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 1.2rem;
  color: #999;
  margin-bottom: 20px;
}

.view-more {
  text-align: center;
  margin-top: 20px;
}

/* 创建预约弹窗 */
.form-tip {
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
}

/* 弹窗样式 */
.dialog-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-notice {
  margin-bottom: 8px;
}

.notice-list {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  line-height: 1.6;
}

.notice-list li {
  margin-bottom: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .banner-text {
    margin-right: 0;
    margin-bottom: 30px;
  }
  
  .banner-text h1 {
    font-size: 2rem;
  }
  
  .banner-text p {
    font-size: 1rem;
  }
  
  .user-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .stats-card {
    min-width: 80px;
  }
  
  .features-section h2,
  .section-header h2 {
    font-size: 1.5rem;
  }
  
  .feature-card {
    padding: 20px 15px;
  }
  
  .feature-icon-container {
    width: 60px;
    height: 60px;
  }
  
  .feature-icon {
    font-size: 1.5rem;
  }
  
  .feature-card h3 {
    font-size: 1.3rem;
  }
}
</style>
