<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import gameInvitationService from '@/services/gameInvitationService';
import { ElMessage } from 'element-plus';
import apiClient from '@/apiClient';

const router = useRouter();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const isAdmin = computed(() => userStore.hasRole('admin'));

// 游戏邀请统计
const gameInvitationStats = ref({
  sent: 0,
  received: 0,
  pending: 0,
  accepted: 0
});

// 获取游戏邀请统计数据
const fetchGameInvitationStats = async () => {
  try {
    const stats = await gameInvitationService.getSimplifiedStatistics();
    gameInvitationStats.value = stats;
  } catch (error) {
    console.error('获取游戏邀请统计失败:', error);
  }
};

// 快捷导航
const navigateTo = (path) => {
  router.push(path);
};

// 用户创建弹窗
const userDialogVisible = ref(false);
const userForm = ref({
  username: '',
  password: '',
  roles: []
});

// 角色列表
const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '部门经理' },
  { value: 'employee', label: '普通员工' }
];

// 表单校验规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  roles: [
    { required: true, message: '请选择角色', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }
  ]
};

// 表单引用
const userFormRef = ref(null);

// 提交状态
const submitLoading = ref(false);

// 重置表单
const resetForm = () => {
  userForm.value = {
    username: '',
    password: '',
    roles: []
  };
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 关闭对话框
const closeDialog = () => {
  userDialogVisible.value = false;
  resetForm();
};

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 调用注册API
        const response = await apiClient.post('/auth/register', userForm.value);
        
        ElMessage.success('用户创建成功');
        // 关闭对话框并重置表单
        closeDialog();
      } catch (error) {
        console.error('创建用户失败:', error);
        ElMessage.error(error.response?.data?.message || '创建用户失败，请稍后重试');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchGameInvitationStats();
});
</script>

<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="welcome-card">
          <h2>欢迎回来，{{ userInfo?.name || '用户' }}</h2>
          <p>今天是 {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </el-col>
    </el-row>
    
    <!-- 游戏邀约统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon game-sent"><Message /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.sent || 0 }}</div>
              <div class="stat-label">游戏邀请(发送)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon game-received"><ChatDotRound /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.received || 0 }}</div>
              <div class="stat-label">游戏邀请(收到)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon pending"><Timer /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.pending || 0 }}</div>
              <div class="stat-label">待处理邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon completed"><Select /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.accepted || 0 }}</div>
              <div class="stat-label">已接受邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions-row">
      <el-col :span="24">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button @click="navigateTo('/game-invitations')" class="action-btn create-btn">
          <el-icon><Message /></el-icon>
          <span>游戏邀请</span>
        </el-button>
            <el-button v-if="isAdmin" type="danger" @click="userDialogVisible = true">
              <el-icon><User /></el-icon>
              添加用户
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 游戏邀请统计 -->
    <el-row :gutter="20" v-if="gameInvitationStats.sent || gameInvitationStats.received">
      <el-col :span="24">
        <el-card class="invitation-stats-card">
          <template #header>
            <div class="card-header">
              <span>游戏邀请统计</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <h4>发送的邀请</h4>
              <el-progress 
                :percentage="gameInvitationStats.sent?.total ? (gameInvitationStats.sent.pending / gameInvitationStats.sent.total) * 100 : 0" 
                :format="() => `待处理: ${gameInvitationStats.sent?.pending || 0}`"
                status="warning"
              />
              <el-progress 
                :percentage="gameInvitationStats.sent?.total ? (gameInvitationStats.sent.accepted / gameInvitationStats.sent.total) * 100 : 0" 
                :format="() => `已接受: ${gameInvitationStats.sent?.accepted || 0}`"
                status="success"
              />
              <el-progress 
                :percentage="gameInvitationStats.sent?.total ? (gameInvitationStats.sent.rejected / gameInvitationStats.sent.total) * 100 : 0" 
                :format="() => `已拒绝: ${gameInvitationStats.sent?.rejected || 0}`"
                status="exception"
              />
            </el-col>
            <el-col :xs="24" :md="12">
              <h4>收到的邀请</h4>
              <el-progress 
                :percentage="gameInvitationStats.received?.total ? (gameInvitationStats.received.pending / gameInvitationStats.received.total) * 100 : 0" 
                :format="() => `待处理: ${gameInvitationStats.received?.pending || 0}`"
                status="warning"
              />
              <el-progress 
                :percentage="gameInvitationStats.received?.total ? (gameInvitationStats.received.accepted / gameInvitationStats.received.total) * 100 : 0" 
                :format="() => `已接受: ${gameInvitationStats.received?.accepted || 0}`"
                status="success"
              />
              <el-progress 
                :percentage="gameInvitationStats.received?.total ? (gameInvitationStats.received.rejected / gameInvitationStats.received.total) * 100 : 0" 
                :format="() => `已拒绝: ${gameInvitationStats.received?.rejected || 0}`"
                status="exception"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 用户创建弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      title="添加用户"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="角色" prop="roles">
          <el-select v-model="userForm.roles" placeholder="请选择角色" multiple style="width: 100%">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 全局样式和背景 */
.dashboard-container {
  padding: 30px;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 60px);
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  z-index: 0;
  border-radius: 0 0 50% 50% / 30px;
}

/* 欢迎卡片 */
.welcome-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  opacity: 0.05;
  z-index: -1;
}

.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.welcome-card h2 {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
}

.welcome-card p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

/* 统计卡片 */
.stat-row {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.stat-card {
  height: 100%;
  margin-bottom: 20px;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: 10px;
  position: relative;
  overflow: hidden;
}

.stat-card-content::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 0;
}

.stat-icon {
  font-size: 40px;
  margin-right: 20px;
  padding: 16px;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.stat-icon.document {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-icon.workflow {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.stat-icon.completed {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.stat-icon.game-sent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.game-received {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-card-content .stat-icon.document + .stat-info::before {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card-content .stat-icon.workflow + .stat-info::before {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card-content .stat-icon.pending + .stat-info::before {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card-content .stat-icon.completed + .stat-info::before {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card-content .stat-icon.game-sent + .stat-info::before {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-content .stat-icon.game-received + .stat-info::before {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 快捷操作卡片 */
.quick-actions-row {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.quick-actions-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
}

.quick-actions-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
  padding: 20px;
}

.quick-actions-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px;
}

.quick-actions .el-button {
  border-radius: 12px;
  padding: 15px 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.quick-actions .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.quick-actions .action-btn.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-actions .el-button[type="danger"] {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* 邀请统计卡片 */
.invitation-stats-card {
  margin-bottom: 30px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
}

.invitation-stats-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border-bottom: none;
  padding: 20px;
}

.invitation-stats-card .card-header {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.invitation-stats-card h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 16px;
}

.invitation-stats-card :deep(.el-progress) {
  margin-bottom: 15px;
}

.invitation-stats-card :deep(.el-progress-bar__outer) {
  border-radius: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invitation-stats-card :deep(.el-progress-bar__inner) {
  border-radius: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .welcome-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .welcome-card h2 {
    font-size: 24px;
  }
  
  .stat-card-content {
    padding: 8px;
  }
  
  .stat-icon {
    font-size: 32px;
    padding: 12px;
    margin-right: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .el-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .welcome-card {
    padding: 15px;
  }
  
  .welcome-card h2 {
    font-size: 20px;
  }
  
  .stat-icon {
    font-size: 28px;
    padding: 10px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>