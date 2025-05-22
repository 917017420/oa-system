<template>
  <div class="admin-invitations-container">
    <h2>游戏邀请管理</h2>
    
    <!-- 统计信息卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon sent"><Message /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.sent?.total || 0 }}</div>
              <div class="stat-label">总发送邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon received"><ChatDotRound /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.received?.total || 0 }}</div>
              <div class="stat-label">总接收邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon pending"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.sent?.pending || 0 }}</div>
              <div class="stat-label">待处理邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <el-icon class="stat-icon accepted"><Check /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.sent?.accepted || 0 }}</div>
              <div class="stat-label">已接受邀请</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 邀请列表 -->
    <el-card class="invitation-list-card">
      <template #header>
        <div class="card-header">
          <span>所有游戏邀请</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索游戏名称或用户"
            style="width: 250px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="filteredInvitations"
        style="width: 100%"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column prop="gameName" label="游戏名称" min-width="120" />
        
        <el-table-column label="发送者" min-width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" :src="scope.row.sender?.avatar || ''">{{ scope.row.sender?.name?.charAt(0) || '?' }}</el-avatar>
              <span>{{ scope.row.sender?.name || '未知用户' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="接收者" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.receivers && scope.row.receivers.length > 0">
              <el-tooltip
                v-for="(receiver, index) in scope.row.receivers.slice(0, 3)"
                :key="receiver._id"
                :content="receiver.name"
                placement="top"
              >
                <el-avatar
                  :size="32"
                  :src="receiver.avatar || ''"
                  :style="{ marginRight: '5px' }"
                >{{ receiver.name?.charAt(0) || '?' }}</el-avatar>
              </el-tooltip>
              <el-tag v-if="scope.row.receivers.length > 3" size="small">
                +{{ scope.row.receivers.length - 3 }}
              </el-tag>
            </div>
            <span v-else>无接收者</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="viewInvitationDetails(scope.row._id)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="邀请详情"
      width="600px"
    >
      <div v-if="selectedInvitation" class="invitation-details">
        <div class="detail-item">
          <span class="label">游戏名称:</span>
          <span class="value">{{ selectedInvitation.gameName }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">发送者:</span>
          <div class="user-info">
            <el-avatar :size="32" :src="selectedInvitation.sender?.avatar || ''">{{ selectedInvitation.sender?.name?.charAt(0) || '?' }}</el-avatar>
            <span>{{ selectedInvitation.sender?.name || '未知用户' }}</span>
          </div>
        </div>
        
        <div class="detail-item">
          <span class="label">接收者:</span>
          <div class="receivers-list">
            <div v-for="receiver in selectedInvitation.receivers" :key="receiver._id" class="user-info">
              <el-avatar :size="32" :src="receiver.avatar || ''">{{ receiver.name?.charAt(0) || '?' }}</el-avatar>
              <span>{{ receiver.name || '未知用户' }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-item">
          <span class="label">消息:</span>
          <span class="value">{{ selectedInvitation.message || '无消息' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">状态:</span>
          <el-tag :type="getStatusType(selectedInvitation.status)">
            {{ getStatusText(selectedInvitation.status) }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <span class="label">创建时间:</span>
          <span class="value">{{ new Date(selectedInvitation.createdAt).toLocaleString('zh-CN') }}</span>
        </div>
        
        <div class="detail-item" v-if="selectedInvitation.scheduledTime">
          <span class="label">计划时间:</span>
          <span class="value">{{ new Date(selectedInvitation.scheduledTime).toLocaleString('zh-CN') }}</span>
        </div>
        
        <div class="detail-item" v-if="selectedInvitation.responses && selectedInvitation.responses.length > 0">
          <span class="label">回应:</span>
          <div class="responses-list">
            <div v-for="response in selectedInvitation.responses" :key="response.user._id" class="response-item">
              <div class="user-info">
                <el-avatar :size="24" :src="response.user?.avatar || ''">{{ response.user?.name?.charAt(0) || '?' }}</el-avatar>
                <span>{{ response.user?.name || '未知用户' }}</span>
              </div>
              <el-tag :type="response.status === 'accepted' ? 'success' : 'danger'">
                {{ response.status === 'accepted' ? '已接受' : '已拒绝' }}
              </el-tag>
              <span v-if="response.proposedTime" class="proposed-time">
                提议时间: {{ new Date(response.proposedTime).toLocaleString('zh-CN') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gameInvitationService from '@/services/gameInvitationService';

const router = useRouter();
const invitations = ref([]);
const loading = ref(true);
const error = ref(null);
const statistics = ref({});
const searchQuery = ref('');

// 详情对话框
const showDetailsDialog = ref(false);
const selectedInvitation = ref(null);

// 获取所有邀请
const fetchAllInvitations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gameInvitationService.getAllInvitations();
    invitations.value = response;
  } catch (err) {
    console.error('Error fetching all invitations:', err);
    error.value = err.msg || err.message || '获取邀请列表失败。';
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await gameInvitationService.getInvitationStatistics();
    statistics.value = response;
  } catch (err) {
    console.error('Error fetching invitation statistics:', err);
  }
};

// 过滤邀请列表
const filteredInvitations = computed(() => {
  if (!searchQuery.value) return invitations.value;
  
  const query = searchQuery.value.toLowerCase();
  return invitations.value.filter(invitation => {
    // 搜索游戏名称
    if (invitation.gameName.toLowerCase().includes(query)) return true;
    
    // 搜索发送者
    if (invitation.sender?.name?.toLowerCase().includes(query)) return true;
    if (invitation.sender?.username?.toLowerCase().includes(query)) return true;
    
    // 搜索接收者
    if (invitation.receivers?.some(receiver => {
      return receiver.name?.toLowerCase().includes(query) ||
             receiver.username?.toLowerCase().includes(query);
    })) return true;
    
    return false;
  });
});

// 查看邀请详情
const viewInvitationDetails = async (invitationId) => {
  try {
    const invitation = await gameInvitationService.getInvitationById(invitationId);
    selectedInvitation.value = invitation;
    showDetailsDialog.value = true;
  } catch (err) {
    console.error('Error fetching invitation details:', err);
    alert('获取邀请详情失败');
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '等待中',
    accepted: '已接受',
    rejected: '已拒绝',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

// 获取状态类型（用于标签颜色）
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    cancelled: 'info',
  };
  return typeMap[status] || '';
};

onMounted(() => {
  fetchAllInvitations();
  fetchStatistics();
});
</script>

<style scoped>
.admin-invitations-container {
  padding: 20px;
}

.admin-invitations-container h2 {
  margin-bottom: 20px;
  color: #303133;
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

.stat-icon.sent {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-icon.received {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-icon.pending {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-icon.accepted {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.invitation-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 详情对话框样式 */
.invitation-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
}

.receivers-list, .responses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.proposed-time {
  font-size: 12px;
  color: #909399;
}
</style>