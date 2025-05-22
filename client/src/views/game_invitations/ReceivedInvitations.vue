<template>
  <div class="received-invitations-container">
    <div class="invitation-header">
      <h2>我收到的邀约</h2>
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
        <div class="empty-icon">📬</div>
        <p>您没有收到任何游戏邀约</p>
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
          <div class="sender-info">
            <span class="sender-label">来自:</span>
            <span class="sender-name">{{ invitation.sender?.name || invitation.sender?.username || '未知发送者' }}</span>
          </div>
          
          <div v-if="invitation.message" class="message-section">
            <p class="message-text">{{ invitation.message }}</p>
          </div>
          
          <div class="invitation-details">
            <p class="time-info">
              <strong>收到时间:</strong> {{ formatDateTime(invitation.createdAt) }}
            </p>
          </div>
          
          <div v-if="currentUserResponse(invitation)" class="response-info">
            <div class="response-badge" :class="getResponseClass(currentUserResponse(invitation).status)">
              <span>您的回应: {{ getResponseStatusText(currentUserResponse(invitation).status) }}</span>
              <span v-if="currentUserResponse(invitation).status === 'accepted' && currentUserResponse(invitation).proposedTime" class="proposed-time">
                建议时间: {{ formatDateTime(currentUserResponse(invitation).proposedTime) }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="invitation.status === 'pending' && !hasUserResponded(invitation)" class="card-actions">
          <button @click="showResponseModal(invitation, 'accepted')" 
                  :disabled="respondingId === invitation._id"
                  class="accept-btn">
            接受
          </button>
          <button @click="handleRespond(invitation._id, 'rejected')" 
                  :disabled="respondingId === invitation._id" 
                  class="reject-btn">
            拒绝
          </button>
        </div>
        
        <p v-if="responseError && respondingId === invitation._id" class="error-message">{{ responseError }}</p>
      </div>
    </div>

    <!-- Response Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h4>回应邀约: {{ selectedInvitation?.gameName }}</h4>
          <button @click="closeModal" class="close-btn" :disabled="isSubmittingResponse">×</button>
        </div>
        
        <div class="modal-body">
          <p>您确定要 <strong>{{ responseAction === 'accepted' ? '接受' : '拒绝' }}</strong> 这个邀约吗?</p>
          
          <div v-if="responseAction === 'accepted'" class="time-selector">
            <label for="proposedTime">建议时间 (可选):</label>
            <input type="datetime-local" id="proposedTime" v-model="proposedTime" />
          </div>
          
          <p v-if="modalError" class="error-message">{{ modalError }}</p>
        </div>
        
        <div class="modal-actions">
          <button @click="confirmResponse" :disabled="isSubmittingResponse" class="confirm-btn">
            {{ isSubmittingResponse ? '提交中...' : '确认' }}
          </button>
          <button @click="closeModal" :disabled="isSubmittingResponse" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import gameInvitationService from '@/services/gameInvitationService';
// 假设我们有一个方法来获取当前登录用户的ID，这里用一个占位符
const getCurrentUserId = () => localStorage.getItem('userId'); // 或者从 Vuex/Pinia store 获取

const router = useRouter();
const invitations = ref([]);
const loading = ref(true);
const error = ref(null);
const respondingId = ref(null); // Tracks which invitation is being responded to
const responseError = ref(null);

const showModal = ref(false);
const selectedInvitation = ref(null);
const responseAction = ref(''); // 'accepted' or 'rejected'
const proposedTime = ref('');
const isSubmittingResponse = ref(false);
const modalError = ref(null);

const fetchReceivedInvitations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await gameInvitationService.getReceivedInvitations();
    invitations.value = response;
  } catch (err) {
    console.error('Error fetching received invitations:', err);
    error.value = err.msg || err.message || '获取收到的邀约失败。';
  } finally {
    loading.value = false;
  }
};

// 刷新邀约列表
const refreshInvitations = () => {
  fetchReceivedInvitations();
};

const currentUserId = getCurrentUserId(); // 在 setup 作用域内获取一次

const currentUserResponse = (invitation) => {
  if (!invitation.responses || !currentUserId) return null;
  return invitation.responses.find(r => r.user === currentUserId || r.user?._id === currentUserId);
};

const hasUserResponded = (invitation) => {
  return !!currentUserResponse(invitation);
};

const showResponseModal = (invitation, action) => {
  selectedInvitation.value = invitation;
  responseAction.value = action;
  proposedTime.value = ''; // Reset proposed time
  modalError.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedInvitation.value = null;
  responseAction.value = '';
  proposedTime.value = '';
  isSubmittingResponse.value = false;
};

const confirmResponse = async () => {
  if (!selectedInvitation.value) return;
  await handleRespond(selectedInvitation.value._id, responseAction.value, proposedTime.value);
  if (!modalError.value) { // Only close modal if response was successful
    closeModal();
  }
};

const handleRespond = async (invitationId, status, time = null) => {
  respondingId.value = invitationId;
  if (showModal.value) {
    isSubmittingResponse.value = true;
    modalError.value = null;
  } else {
    responseError.value = null;
  }
  
  const responseData = { status };
  if (status === 'accepted' && time) {
    responseData.proposedTime = time;
  }

  try {
    const updatedInvitation = await gameInvitationService.respondToInvitation(invitationId, responseData);
    // Update the invitation in the list
    const index = invitations.value.findIndex(inv => inv._id === invitationId);
    if (index !== -1) {
      invitations.value[index] = { ...invitations.value[index], ...updatedInvitation };
    }
    // alert(`已成功${status === 'accepted' ? '接受' : '拒绝'}邀约。`);
  } catch (err) {
    console.error('Error responding to invitation:', err);
    const errMsg = err.msg || err.message || `回应邀约失败: ${status}`;
    if (showModal.value) {
      modalError.value = errMsg;
    } else {
      responseError.value = errMsg;
    }
    // alert(`回应邀约失败: ${responseError.value}`);
  } finally {
    if (showModal.value) {
      // Keep modal open on error, don't reset respondingId here
      // isSubmittingResponse will be reset in closeModal if successful or if user cancels
    } else {
      respondingId.value = null;
    }
    // If not in modal, or if successful, isSubmittingResponse should be false
    if (!modalError.value || !showModal.value) {
        isSubmittingResponse.value = false;
    }
  }
};

// 获取邀约状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '等待回应中',
    accepted: '已接受 (等待最终确认)',
    rejected: '已拒绝',
    cancelled: '已取消',
    confirmed: '已确认/已安排'
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

// 获取回应状态样式类
const getResponseClass = (status) => {
  const statusClassMap = {
    pending: 'status-waiting',
    accepted: 'status-accepted',
    rejected: 'status-rejected'
  };
  return statusClassMap[status] || 'status-waiting';
};

const getResponseStatusText = (status) => {
  const statusMap = {
    pending: '等待回应',
    accepted: '已接受',
    rejected: '已拒绝',
  };
  return statusMap[status] || status;
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return dateTimeString; 
  }
};

onMounted(() => {
  if (!currentUserId) {
    error.value = '无法获取当前用户信息，请重新登录。';
    loading.value = false;
    return;
  }
  fetchReceivedInvitations();
});
</script>

<style scoped>
.received-invitations-container {
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

.sender-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.sender-label {
  font-weight: 500;
  color: #555;
  margin-right: 8px;
}

.sender-name {
  color: #333;
}

.message-section {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.message-text {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.invitation-details {
  margin-top: 10px;
}

.time-info {
  margin: 5px 0;
  font-size: 0.8rem;
  color: #777;
}

.response-info {
  margin-top: 15px;
}

.response-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.proposed-time {
  display: block;
  font-size: 0.8rem;
  margin-top: 4px;
}

.card-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #eee;
}

.accept-btn {
  flex: 1;
  padding: 8px 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.accept-btn:hover {
  background-color: #388e3c;
}

.reject-btn {
  flex: 1;
  padding: 8px 0;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.reject-btn:hover {
  background-color: #d32f2f;
}

.accept-btn:disabled,
.reject-btn:disabled {
  background-color: #ccc;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.modal-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #777;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.time-selector {
  margin-top: 15px;
}

.time-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.time-selector input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f0f2f5;
  color: #555;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.confirm-btn:hover {
  background-color: #3a7bc8;
}

.cancel-btn:hover {
  background-color: #e1e4e8;
}

.confirm-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>