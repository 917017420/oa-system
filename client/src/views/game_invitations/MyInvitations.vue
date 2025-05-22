<template>
  <div class="my-invitations-container">
    <div class="invitation-header">
      <h2>我发出的邀约</h2>
      <button @click="refreshInvitations" class="refresh-btn" :disabled="loading">
        <span class="refresh-icon">↻</span> 刷新
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载邀约...</p>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="!loading && invitations.length === 0 && !error" class="no-invitations">
      <div class="empty-state">
        <div class="empty-icon">📮</div>
        <p>您还没有发出任何游戏邀约</p>
        <router-link to="/game-invitations/create" class="create-btn">创建新邀约</router-link>
      </div>
    </div>
    
    <div v-if="!loading && invitations.length > 0" class="invitations-grid">
      <div v-for="invitation in invitations" :key="invitation._id" class="invitation-card">
        <div class="card-header">
          <h3>{{ invitation.gameName }}</h3>
          <div class="status-badge" :class="getStatusClass(invitation.status)">
            {{ getStatusText(invitation.status) }}
          </div>
        </div>
        
        <div class="card-body">
          <div class="receivers-section">
            <h4>接收人状态</h4>
            <div class="receivers-list">
              <div v-for="receiver in invitation.receivers" :key="receiver._id" class="receiver-item">
                <span class="receiver-name">{{ receiver.name || receiver.username }}</span>
                <span class="response-status" :class="getResponseStatusClass(getReceiverResponse(invitation, receiver._id))">
                  {{ getReceiverResponseText(invitation, receiver._id) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="invitation-details">
            <p v-if="invitation.message" class="message-text">
              <strong>留言:</strong> {{ invitation.message }}
            </p>
            <p class="time-info">
              <strong>创建时间:</strong> {{ formatDateTime(invitation.createdAt) }}
            </p>
            <p v-if="invitation.scheduledTime" class="time-info">
              <strong>约定时间:</strong> {{ formatDateTime(invitation.scheduledTime) }}
            </p>
          </div>
        </div>
        
        <div class="card-actions" v-if="invitation.status === 'pending'">
          <button @click="handleCancelInvitation(invitation._id)" 
                  :disabled="cancellingId === invitation._id"
                  class="cancel-btn">
            {{ cancellingId === invitation._id ? '取消中...' : '取消邀约' }}
          </button>
        </div>
        
        <p v-if="cancelError && cancellingId === invitation._id" class="error-message">{{ cancelError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gameInvitationService from '@/services/gameInvitationService';

const router = useRouter();
const invitations = ref([]);
const loading = ref(true);
const error = ref(null);
const cancellingId = ref(null); // To track which invitation is being cancelled
const cancelError = ref(null);

const fetchSentInvitations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gameInvitationService.getSentInvitations();
    invitations.value = response;
  } catch (err) {
    console.error('Error fetching sent invitations:', err);
    error.value = err.msg || err.message || '获取我发出的邀约失败。';
  } finally {
    loading.value = false;
  }
};

// 刷新邀约列表
const refreshInvitations = () => {
  fetchSentInvitations();
};

const handleCancelInvitation = async (invitationId) => {
  cancellingId.value = invitationId;
  cancelError.value = null;
  const confirmCancel = confirm('您确定要取消这个游戏邀约吗？');
  if (!confirmCancel) {
    cancellingId.value = null;
    return;
  }

  try {
    await gameInvitationService.cancelInvitation(invitationId);
    // Refresh the list or update the specific invitation's status
    const index = invitations.value.findIndex(inv => inv._id === invitationId);
    if (index !== -1) {
      invitations.value[index].status = 'cancelled';
    }
    // Or simply re-fetch: await fetchSentInvitations();
    alert('邀约已取消。');
  } catch (err) {
    console.error('Error cancelling invitation:', err);
    cancelError.value = err.msg || err.message || '取消邀约失败。';
    alert(`取消邀约失败: ${cancelError.value}`);
  } finally {
    cancellingId.value = null;
  }
};

// 获取邀约状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '等待中',
    accepted: '已接受',
    rejected: '已拒绝',
    cancelled: '已取消',
    confirmed: '已确认'
  };
  return statusMap[status] || status;
};

// 获取邀约状态样式类
const getStatusClass = (status) => {
  const statusClassMap = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    rejected: 'status-rejected',
    cancelled: 'status-cancelled',
    confirmed: 'status-confirmed'
  };
  return statusClassMap[status] || '';
};

// 获取接收人回应状态文本
const getReceiverResponseText = (invitation, receiverId) => {
  const response = getReceiverResponse(invitation, receiverId);
  if (!response) return '等待回应';
  
  const statusText = getResponseStatusText(response.status);
  if (response.status === 'accepted' && response.proposedTime) {
    return `${statusText} (建议时间: ${formatDateTime(response.proposedTime)})`;
  }
  return statusText;
};

// 获取回应状态样式类
const getResponseStatusClass = (response) => {
  if (!response) return 'status-waiting';
  
  const statusClassMap = {
    pending: 'status-waiting',
    accepted: 'status-accepted',
    rejected: 'status-rejected'
  };
  return statusClassMap[response.status] || '';
};

const getResponseStatusText = (status) => {
  const statusMap = {
    pending: '等待回应',
    accepted: '已接受',
    rejected: '已拒绝',
  };
  return statusMap[status] || status;
};

const getReceiverResponse = (invitation, receiverId) => {
  if (!invitation.responses) return null;
  return invitation.responses.find(r => r.user._id === receiverId || r.user === receiverId);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return dateTimeString; // Fallback if date is invalid
  }
};

onMounted(() => {
  fetchSentInvitations();
});

</script>

<style scoped>
.my-invitations-container {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.invitation-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f2f5;
  color: #555;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: #e1e4e8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  margin-right: 5px;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.create-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #3a7bc8;
}

.invitations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.invitation-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.invitation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff8e1;
  color: #f57c00;
}

.status-accepted {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
}

.status-cancelled {
  background-color: #f5f5f5;
  color: #757575;
}

.status-confirmed {
  background-color: #e3f2fd;
  color: #1565c0;
}

.status-waiting {
  background-color: #f5f5f5;
  color: #757575;
}

.card-body {
  padding: 15px;
}

.receivers-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #555;
}

.receivers-list {
  margin-bottom: 15px;
}

.receiver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.receiver-item:last-child {
  border-bottom: none;
}

.receiver-name {
  font-size: 0.9rem;
  color: #333;
}

.response-status {
  font-size: 0.8rem;
  padding: 3px 6px;
  border-radius: 4px;
}

.invitation-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.message-text {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #555;
}

.time-info {
  margin: 5px 0;
  font-size: 0.8rem;
  color: #777;
}

.card-actions {
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #d32f2f;
}

.cancel-btn:disabled {
  background-color: #ffcdd2;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 10px;
  padding: 8px;
  background-color: #fdecea;
  border-radius: 4px;
  text-align: center;
}
</style>