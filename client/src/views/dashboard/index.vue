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
            <el-button type="primary" @click="navigateTo('/game-invitations/create')">
              <el-icon><Plus /></el-icon>
              创建游戏邀请
            </el-button>
            <el-button type="success" @click="navigateTo('/game-invitations/sent')">
              <el-icon><Message /></el-icon>
              我发送的邀请
            </el-button>
            <el-button type="warning" @click="navigateTo('/game-invitations/received')">
              <el-icon><ChatDotRound /></el-icon>
              我收到的邀请
            </el-button>
            <el-button v-if="isAdmin" type="info" @click="navigateTo('/game-invitations/admin')">
              <el-icon><Management /></el-icon>
              邀请管理
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
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.welcome-card p {
  margin: 0;
  color: #909399;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  margin-bottom: 20px;
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  padding: 10px;
  border-radius: 8px;
}

.stat-icon.document {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-icon.workflow {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-icon.pending {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-icon.completed {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-icon.game-sent {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-icon.game-received {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-actions-row {
  margin-bottom: 20px;
}

.invitation-stats-card {
  margin-bottom: 20px;
}

.invitation-stats-card h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.box-card {
  margin-bottom: 20px;
}
</style>