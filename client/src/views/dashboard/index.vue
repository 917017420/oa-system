<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import gameInvitationService from '@/services/gameInvitationService';

const router = useRouter();
const userStore = useUserStore();
const userInfo = userStore.userInfo;
const isAdmin = computed(() => userStore.hasRole('admin'));

// 统计数据
const statistics = ref({
  documents: 0,
  workflows: 0,
  pendingTasks: 0,
  completedTasks: 0
});

// 游戏邀请统计
const gameInvitationStats = ref({
  sent: { total: 0, pending: 0, accepted: 0 },
  received: { total: 0, pending: 0, accepted: 0 }
});

// 待办事项和最近文档已根据用户要求移除

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // 模拟API调用
    // const response = await axios.get('/api/dashboard/statistics');
    // statistics.value = response.data;
    
    // 模拟数据
    statistics.value = {
      documents: 125,
      workflows: 18,
      pendingTasks: 7,
      completedTasks: 32
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 获取游戏邀请统计数据
const fetchGameInvitationStats = async () => {
  try {
    const response = await gameInvitationService.getInvitationStatistics();
    gameInvitationStats.value = response;
  } catch (error) {
    console.error('获取游戏邀请统计失败:', error);
  }
};

// 快捷导航
const navigateTo = (path) => {
  router.push(path);
};

onMounted(() => {
  fetchStatistics();
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
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon document"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.documents }}</div>
              <div class="stat-label">文档总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon workflow"><Connection /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.workflows }}</div>
              <div class="stat-label">工作流程</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon pending"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pendingTasks }}</div>
              <div class="stat-label">待办任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon completed"><Check /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.completedTasks }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon game-sent"><Message /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.sent?.total || 0 }}</div>
              <div class="stat-label">游戏邀请(发送)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon game-received"><ChatDotRound /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ gameInvitationStats.received?.total || 0 }}</div>
              <div class="stat-label">游戏邀请(收到)</div>
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