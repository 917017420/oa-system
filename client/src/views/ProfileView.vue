<template>
  <div class="profile-view">
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">个人资料</h1>
      </div>

      <el-row :gutter="24">
        <!-- 左侧个人信息 -->
        <el-col :xs="24" :lg="16">
          <div class="profile-card">
            <h3 class="card-title">基本信息</h3>
            
            <el-form 
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              @submit.prevent="handleUpdateProfile"
            >
              <!-- 头像上传 -->
              <el-form-item label="头像">
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :http-request="handleAvatarUpload"
                    :disabled="avatarLoading"
                  >
                    <div class="avatar-container">
                      <el-avatar 
                        :size="80" 
                        :src="profileForm.avatar || userStore.user?.avatar"
                        :icon="UserFilled"
                        class="user-avatar"
                      />
                      <div class="avatar-overlay" v-loading="avatarLoading">
                        <el-icon class="avatar-icon"><Camera /></el-icon>
                        <span class="avatar-text">点击上传</span>
                      </div>
                    </div>
                  </el-upload>
                  <div class="avatar-tips">
                    <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="profileForm.username"
                  placeholder="请输入用户名"
                  :disabled="profileLoading"
                />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="profileForm.email"
                  type="email"
                  placeholder="请输入邮箱"
                  :disabled="profileLoading"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="profileLoading"
                  @click="handleUpdateProfile"
                >
                  保存修改
                </el-button>
                <el-button @click="resetProfileForm">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 修改密码 -->
          <div class="password-card">
            <h3 class="card-title">修改密码</h3>
            
            <el-form 
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              @submit.prevent="handleChangePassword"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input 
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                  :disabled="passwordLoading"
                />
              </el-form-item>
              
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  :disabled="passwordLoading"
                />
              </el-form-item>
              
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  :disabled="passwordLoading"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="passwordLoading"
                  @click="handleChangePassword"
                >
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
        
        <!-- 右侧统计信息 -->
        <el-col :xs="24" :lg="8">
          <div class="stats-card">
            <h3 class="card-title">我的统计</h3>
            
            <div v-if="statsLoading" class="stats-loading">
              <el-skeleton :rows="4" animated />
            </div>
            
            <div v-else class="stats-list">
              <div class="stat-item">
                <div class="stat-icon created">
                  <el-icon><Plus /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">创建的预约</div>
                  <div class="stat-value">{{ stats.createdCount || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon joined">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">参与的预约</div>
                  <div class="stat-value">{{ stats.joinedCount || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon upcoming">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">即将到来</div>
                  <div class="stat-value">{{ stats.upcomingCount || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon total">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">总计预约</div>
                  <div class="stat-value">{{ stats.totalCount || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 账户信息 -->
          <div class="account-card">
            <h3 class="card-title">账户信息</h3>
            
            <div class="account-info">
              <div class="info-item">
                <span class="info-label">注册时间：</span>
                <span class="info-value">{{ formatDate(userStore.user?.createdAt) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">最后登录：</span>
                <span class="info-value">{{ formatDate(userStore.user?.lastLoginAt) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">用户ID：</span>
                <span class="info-value user-id">{{ userStore.user?._id }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Plus,
  UserFilled,
  Clock,
  Calendar,
  Camera,
  Upload
} from '@element-plus/icons-vue'

const userStore = useUserStore()

// 表单引用
const profileFormRef = ref()
const passwordFormRef = ref()

// 加载状态
const profileLoading = ref(false)
const passwordLoading = ref(false)
const statsLoading = ref(false)
const avatarLoading = ref(false)

// 个人资料表单
const profileForm = reactive({
  username: '',
  email: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 统计数据
const stats = reactive({
  createdCount: 0,
  joinedCount: 0,
  upcomingCount: 0,
  totalCount: 0
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initProfileForm = () => {
  if (userStore.user) {
    profileForm.username = userStore.user.username || ''
    profileForm.email = userStore.user.email || ''
    profileForm.avatar = userStore.user.avatar || ''
  }
}

// 重置个人资料表单
const resetProfileForm = () => {
  initProfileForm()
  profileFormRef.value?.clearValidate()
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    const valid = await profileFormRef.value?.validate()
    if (!valid) return
    
    profileLoading.value = true
    const result = await userStore.updateProfile(profileForm)
    if (result.success) {
      ElMessage.success('个人资料更新成功')
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
  } finally {
    profileLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    const valid = await passwordFormRef.value?.validate()
    if (!valid) return
    
    passwordLoading.value = true
    const result = await userStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  statsLoading.value = true
  try {
    const result = await userStore.getUserStats()
    if (result.success) {
      Object.assign(stats, result.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传
const handleAvatarUpload = async (options) => {
  const file = options.file
  avatarLoading.value = true
  
  try {
    // 创建 FormData 对象
    const formData = new FormData()
    formData.append('avatar', file)
    
    // 调用上传头像的 API
    const result = await userStore.uploadUserAvatar(formData)
    
    if (result.success) {
      profileForm.avatar = result.data.avatarUrl
      ElMessage.success('头像上传成功')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    avatarLoading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  initProfileForm()
  fetchStats()
})
</script>

<style scoped>
.profile-view {
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.profile-card,
.password-card,
.stats-card,
.account-card {
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
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
}

/* 头像上传样式 */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.avatar-text {
  font-size: 12px;
}

.avatar-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.stats-loading {
  padding: 20px 0;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.created {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.joined {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.upcoming {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.total {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #606266;
}

.info-value {
  color: #303133;
}

.user-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  
  .profile-card,
  .password-card,
  .stats-card,
  .account-card {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .stats-list {
    gap: 12px;
  }
  
  .stat-item {
    padding: 10px;
  }
  
  .user-id {
    font-size: 10px;
  }
}
</style>