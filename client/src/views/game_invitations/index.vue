<template>
  <div class="game-invitations-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1>游戏OA</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建OA
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon sent"><Message /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.sent }}</div>
              <div class="stat-label">我发出的</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon received"><Bell /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.received }}</div>
              <div class="stat-label">我收到的</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon pending"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon accepted"><Check /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accepted }}</div>
              <div class="stat-label">已接受</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标签页 -->
    <el-card class="main-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 我发出的邀请 -->
        <el-tab-pane label="我发出的" name="sent">
          <div v-loading="loading.sent">
            <div v-if="sentInvitations.length === 0" class="empty-state">
              <el-empty description="暂无发出的OA">
                <el-button type="primary" @click="showCreateDialog = true">创建OA</el-button>
              </el-empty>
            </div>
            <div v-else class="invitations-grid">
              <div v-for="invitation in sentInvitations" :key="invitation._id" class="invitation-card">
                <div class="card-header">
                  <h3>{{ invitation.gameName }}</h3>
                  <el-tag :type="getStatusType(invitation.status)">{{ getStatusText(invitation.status) }}</el-tag>
                </div>
                <div class="card-body">
                  <div class="receivers-section">
                    <div class="receivers-list">
                      <div v-for="receiver in invitation.receivers" :key="receiver._id" class="receiver-item">
                        <el-avatar :size="24" :src="receiver.avatar">{{ receiver.name?.charAt(0) || 'U' }}</el-avatar>
                        <span class="receiver-name">{{ receiver.name || receiver.username }}</span>
                        <el-tag size="small" :type="getResponseType(getReceiverResponse(invitation, receiver._id))">
                          {{ getResponseText(getReceiverResponse(invitation, receiver._id)) }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                  <div v-if="invitation.message" class="message">
                    <p>{{ invitation.message }}</p>
                  </div>
                  <div class="time-info">
                    <span>{{ formatDateTime(invitation.createdAt) }}</span>
                  </div>
                </div>
                <div v-if="invitation.status === 'pending'" class="card-actions">
                  <el-button size="small" type="danger" @click="cancelInvitation(invitation._id)">
                    取消
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 我收到的邀请 -->
        <el-tab-pane label="我收到的" name="received">
          <div v-loading="loading.received">
            <div v-if="receivedInvitations.length === 0" class="empty-state">
              <el-empty description="暂无收到OA" />
            </div>
            <div v-else class="invitations-grid">
              <div v-for="invitation in receivedInvitations" :key="invitation._id" class="invitation-card">
                <div class="card-header">
                  <h3>{{ invitation.gameName }}</h3>
                  <el-tag :type="getStatusType(invitation.status)">{{ getStatusText(invitation.status) }}</el-tag>
                </div>
                <div class="card-body">
                  <div class="sender-info">
                    <el-avatar :size="32" :src="invitation.sender?.avatar">{{ invitation.sender?.name?.charAt(0) || 'U' }}</el-avatar>
                    <span class="sender-name">{{ invitation.sender?.name || invitation.sender?.username }}</span>
                  </div>
                  <div v-if="invitation.message" class="message">
                    <p>{{ invitation.message }}</p>
                  </div>
                  <div class="time-info">
                    <span>{{ formatDateTime(invitation.createdAt) }}</span>
                  </div>
                  <div v-if="currentUserResponse(invitation)" class="response-info">
                    <el-tag :type="getResponseType(currentUserResponse(invitation).status)">
                      我的回应: {{ getResponseText(currentUserResponse(invitation).status) }}
                    </el-tag>
                  </div>
                </div>
                <div v-if="invitation.status === 'pending' && !hasUserResponded(invitation)" class="card-actions">
                  <el-button size="small" type="primary" @click="respondToInvitation(invitation._id, 'accepted')">
                    接受
                  </el-button>
                  <el-button size="small" @click="respondToInvitation(invitation._id, 'rejected')">
                    拒绝
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 管理员视图 -->
        <el-tab-pane v-if="isAdmin" label="全部OA" name="admin">
          <div v-loading="loading.admin">
            <div class="admin-controls">
              <el-input
                v-model="searchQuery"
                placeholder="搜索游戏名称或用户"
                style="width: 300px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="admin-table-container">
              <!-- 桌面端表格视图 -->
              <el-table 
                :data="filteredAdminInvitations" 
                style="width: 100%" 
                class="desktop-table"
              >
                <el-table-column prop="gameName" label="游戏名称" min-width="120" />
                <el-table-column label="发送者" min-width="120">
                  <template #default="scope">
                    <div class="user-info">
                      <el-avatar :size="24" :src="scope.row.sender?.avatar">{{ scope.row.sender?.name?.charAt(0) || '?' }}</el-avatar>
                      <span>{{ scope.row.sender?.name || '未知用户' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="接收者数量" min-width="100">
                  <template #default="scope">
                    {{ scope.row.receivers?.length || 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" min-width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="创建时间" min-width="150">
                  <template #default="scope">
                    {{ formatDateTime(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" min-width="100">
                  <template #default="scope">
                    <el-button size="small" type="danger" @click="deleteInvitation(scope.row._id)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 移动端卡片视图 -->
              <div class="mobile-admin-cards">
                <div 
                  v-for="invitation in filteredAdminInvitations" 
                  :key="invitation._id" 
                  class="mobile-admin-card"
                >
                  <div class="mobile-card-header">
                    <h3>{{ invitation.gameName }}</h3>
                    <el-tag :type="getStatusType(invitation.status)">{{ getStatusText(invitation.status) }}</el-tag>
                  </div>
                  
                  <div class="mobile-card-content">
                    <div class="mobile-card-item">
                      <span class="mobile-card-label">发送者:</span>
                      <div class="user-info">
                        <el-avatar :size="20" :src="invitation.sender?.avatar">{{ invitation.sender?.name?.charAt(0) || '?' }}</el-avatar>
                        <span>{{ invitation.sender?.name || '未知用户' }}</span>
                      </div>
                    </div>
                    
                    <div class="mobile-card-item">
                      <span class="mobile-card-label">接收者数量:</span>
                      <span>{{ invitation.receivers?.length || 0 }}</span>
                    </div>
                    
                    <div class="mobile-card-item">
                      <span class="mobile-card-label">创建时间:</span>
                      <span>{{ formatDateTime(invitation.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="mobile-card-actions">
                    <el-button size="small" type="danger" @click="deleteInvitation(invitation._id)">
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建邀请对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建游戏OA" width="500px" class="invitation-dialog">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px" class="invitation-form">
        <el-form-item label="游戏名称" prop="gameName">
          <el-input v-model="createForm.gameName" placeholder="请输入游戏名称" />
        </el-form-item>
        
        <el-form-item label="接收者" prop="receivers">
          <el-select
            v-model="createForm.receivers"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="搜索并选择用户"
            :remote-method="searchUsers"
            :loading="loadingUsers"
            style="width: 100%"
            class="receiver-select"
          >
            <el-option
              v-for="user in users"
              :key="user._id"
              :label="`${user.name} (${user.username})`"
              :value="user._id"
            >
              <div class="user-option">
                <el-avatar :size="24" :src="user.avatar">{{ user.name?.charAt(0) || 'U' }}</el-avatar>
                <span>{{ user.name || user.username }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="消息" prop="message">
          <el-input
            v-model="createForm.message"
            type="textarea"
            :rows="3"
            placeholder="请输入留言内容（可选）"
            class="message-textarea"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="createInvitation">创建</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Message, Bell, Clock, Check, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import gameInvitationService from '@/services/gameInvitationService'
import userService from '@/services/userService'

const userStore = useUserStore()

// 响应式数据
const activeTab = ref('sent')
const showCreateDialog = ref(false)
const searchQuery = ref('')
const creating = ref(false)
const loadingUsers = ref(false)

// 加载状态
const loading = reactive({
  sent: false,
  received: false,
  admin: false
})

// 数据
const sentInvitations = ref([])
const receivedInvitations = ref([])
const adminInvitations = ref([])
const users = ref([])

// 统计数据
const stats = reactive({
  sent: 0,
  received: 0,
  pending: 0,
  accepted: 0
})

// 创建表单
const createForm = reactive({
  gameName: '',
  receivers: [],
  message: ''
})

const createFormRef = ref()

// 表单验证规则
const createRules = {
  gameName: [
    { required: true, message: '请输入游戏名称', trigger: 'blur' }
  ],
  receivers: [
    { required: true, message: '请选择接收人', trigger: 'change' }
  ]
}

// 计算属性
const isAdmin = computed(() => userStore.roles.includes('admin'))

const filteredAdminInvitations = computed(() => {
  if (!searchQuery.value) return adminInvitations.value
  const query = searchQuery.value.toLowerCase()
  return adminInvitations.value.filter(invitation => 
    invitation.gameName.toLowerCase().includes(query) ||
    invitation.sender?.name?.toLowerCase().includes(query) ||
    invitation.sender?.username?.toLowerCase().includes(query)
  )
})

// 方法
const refreshData = async () => {
  await Promise.all([
    fetchSentInvitations(),
    fetchReceivedInvitations(),
    isAdmin.value && fetchAdminInvitations(),
    updateStats()
  ])
}

const fetchSentInvitations = async () => {
  loading.sent = true
  try {
    sentInvitations.value = await gameInvitationService.getSentInvitations()
  } catch (error) {
    ElMessage.error('获取发出的邀请失败')
  } finally {
    loading.sent = false
  }
}

const fetchReceivedInvitations = async () => {
  loading.received = true
  try {
    receivedInvitations.value = await gameInvitationService.getReceivedInvitations()
  } catch (error) {
    ElMessage.error('获取收到的邀请失败')
  } finally {
    loading.received = false
  }
}

const fetchAdminInvitations = async () => {
  if (!isAdmin.value) return
  loading.admin = true
  try {
    adminInvitations.value = await gameInvitationService.getAllInvitations()
  } catch (error) {
    ElMessage.error('获取所有邀请失败')
  } finally {
    loading.admin = false
  }
}

const updateStats = async () => {
  try {
    const statsData = await gameInvitationService.getSimplifiedStatistics() // Corrected function name
    Object.assign(stats, statsData)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleTabChange = (tabName) => {
  if (tabName === 'admin' && isAdmin.value && adminInvitations.value.length === 0) {
    fetchAdminInvitations()
  }
}

const searchUsers = async (query) => {
  if (!query && users.value.length > 0) { // Keep preloaded users if query is empty
    // Optionally, you might want to reset to the full preloaded list or filter locally
    // For now, just don't clear if users are already loaded and query is empty
    return;
  }
  if (!query && users.value.length === 0) { // If no query and no users, fetch all
    loadingUsers.value = true;
    try {
      const allUsers = await userService.getSelectableUsers();
      users.value = allUsers.filter(user => user._id !== userStore.userInfo._id);
    } catch (error) {
      ElMessage.error('获取用户列表失败');
    } finally {
      loadingUsers.value = false;
    }
    return;
  }

  loadingUsers.value = true
  try {
    // Assuming userService.getSelectableUsers() can also be used for searching if needed
    // Or, if it always returns all users, filter locally
    const allUsers = await userService.getSelectableUsers() 
    users.value = allUsers.filter(user => 
      user._id !== userStore.userInfo._id &&
      (user.name?.toLowerCase().includes(query.toLowerCase()) ||
       user.username?.toLowerCase().includes(query.toLowerCase()))
    )
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    loadingUsers.value = false
  }
}

const fetchSelectableUsersForDialog = async () => {
  if (users.value.length > 0) return; // Avoid refetching if already loaded
  loadingUsers.value = true;
  try {
    const allUsers = await userService.getSelectableUsers();
    users.value = allUsers.filter(user => user._id !== userStore.userInfo._id);
  } catch (error) {
    ElMessage.error('获取可选用户列表失败');
    users.value = []; // Ensure users is an array in case of error
  } finally {
    loadingUsers.value = false;
  }
};

// Watch for dialog opening to fetch users
watch(showCreateDialog, (newValue) => {
  if (newValue) {
    fetchSelectableUsersForDialog();
    // Reset form when dialog opens, if not already handled elsewhere
    if (createFormRef.value) {
      createFormRef.value.resetFields();
    }
    Object.assign(createForm, {
      gameName: '',
      receivers: [],
      message: ''
    });
  }
});

const createInvitation = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    await gameInvitationService.createInvitation({
      gameName: createForm.gameName,
      receivers: createForm.receivers,
      message: createForm.message
    })
    
    ElMessage.success('邀请创建成功')
    showCreateDialog.value = false
    
    // 重置表单
    Object.assign(createForm, {
      gameName: '',
      receivers: [],
      message: ''
    })
    
    // 刷新数据
    await refreshData()
  } catch (error) {
    ElMessage.error('创建邀请失败')
  } finally {
    creating.value = false
  }
}

const cancelInvitation = async (invitationId) => {
  try {
    await ElMessageBox.confirm('确定要取消这个邀请吗？', '确认取消', {
      type: 'warning'
    })
    
    await gameInvitationService.cancelInvitation(invitationId)
    ElMessage.success('邀请已取消')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消邀请失败')
    }
  }
}

const respondToInvitation = async (invitationId, status) => {
  try {
    await gameInvitationService.respondToInvitation(invitationId, { status })
    ElMessage.success(status === 'accepted' ? '已接受邀请' : '已拒绝邀请')
    await refreshData()
  } catch (error) {
    ElMessage.error('回应邀请失败')
  }
}

const deleteInvitation = async (invitationId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个邀请吗？', '确认删除', {
      type: 'warning'
    })
    
    await gameInvitationService.deleteInvitation(invitationId)
    ElMessage.success('邀请已删除')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除邀请失败')
    }
  }
}

// 工具方法
const getStatusType = (status) => {
  const types = {
    pending: '',
    accepted: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return texts[status] || '未知'
}

const getResponseType = (status) => {
  const types = {
    pending: '',
    accepted: 'success',
    rejected: 'danger'
  }
  return types[status] || ''
}

const getResponseText = (status) => {
  const texts = {
    pending: '待回应',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return texts[status] || '未知'
}

const getReceiverResponse = (invitation, receiverId) => {
  const response = invitation.responses?.find(r => r.receiver === receiverId)
  return response?.status || 'pending'
}

const currentUserResponse = (invitation) => {
  return invitation.responses?.find(r => r.receiver === userStore.userInfo._id)
}

const hasUserResponded = (invitation) => {
  return invitation.responses?.some(r => r.receiver === userStore.userInfo._id)
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
/* 全局样式和背景 */
.game-invitations-container {
  padding: 30px;
  position: relative;
  background-color: #f9fafc;
  min-height: calc(100vh - 60px);
}

.game-invitations-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  opacity: 0.05;
  z-index: 0;
  border-radius: 0 0 50% 50% / 20px;
}

/* 页面标题和操作按钮 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(106, 17, 203, 0.1);
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  border-radius: 12px;
  padding: 12px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.stat-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 5px;
  position: relative;
  overflow: hidden;
}

.stat-content::before {
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

.stat-card:nth-child(1) .stat-content::before {
  background-color: #409eff;
}

.stat-card:nth-child(2) .stat-content::before {
  background-color: #67c23a;
}

.stat-card:nth-child(3) .stat-content::before {
  background-color: #e6a23c;
}

.stat-card:nth-child(4) .stat-content::before {
  background-color: #67c23a;
}

.stat-icon {
  font-size: 36px;
  padding: 16px;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon.sent {
  color: #fff;
  background: linear-gradient(135deg, #3a8eff 0%, #0063e6 100%);
}

.stat-icon.received {
  color: #fff;
  background: linear-gradient(135deg, #67c23a 0%, #4e9a2a 100%);
}

.stat-icon.pending {
  color: #fff;
  background: linear-gradient(135deg, #e6a23c 0%, #c67b0f 100%);
}

.stat-icon.accepted {
  color: #fff;
  background: linear-gradient(135deg, #67c23a 0%, #4e9a2a 100%);
}

.stat-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
  position: relative;
}

.stat-label::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 30px;
  height: 3px;
  border-radius: 3px;
}

.stat-icon.sent + .stat-info .stat-label::after {
  background-color: #409eff;
}

.stat-icon.received + .stat-info .stat-label::after {
  background-color: #67c23a;
}

.stat-icon.pending + .stat-info .stat-label::after {
  background-color: #e6a23c;
}

.stat-icon.accepted + .stat-info .stat-label::after {
  background-color: #67c23a;
}

/* 主内容区 */
.main-content {
  min-height: 500px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.main-content :deep(.el-tabs__header) {
  margin-bottom: 20px;
  padding: 0 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.main-content :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.main-content :deep(.el-tabs__item.is-active) {
  color: #6a11cb;
}

.main-content :deep(.el-tabs__active-bar) {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  height: 3px;
  border-radius: 3px;
}

.admin-controls {
  margin-bottom: 24px;
}

.admin-controls .el-input {
  border-radius: 12px;
  overflow: hidden;
}

/* 邀请卡片网格 */
.invitations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 10px;
}

.invitation-card {
  border: none;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.invitation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.invitation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.invitation-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  margin-bottom: 16px;
}

.receivers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.receiver-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s ease;
}

.receiver-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.receiver-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.02);
}

.sender-name {
  font-weight: 500;
  color: #303133;
}

.message {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: #f9fafc;
  border-radius: 10px;
  font-size: 14px;
  color: #606266;
  position: relative;
  border-left: 3px solid #6a11cb;
}

.time-info {
  font-size: 13px;
  color: #909399;
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.time-info::before {
  content: '🕒';
  margin-right: 5px;
  font-size: 14px;
}

.response-info {
  margin-top: 12px;
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.card-actions .el-button {
  border-radius: 10px;
  padding: 10px 16px;
  transition: all 0.3s ease;
}

.card-actions .el-button:hover {
  transform: translateY(-2px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-state :deep(.el-empty__image) {
  width: 120px;
  height: 120px;
}

.empty-state :deep(.el-button) {
  margin-top: 20px;
  border-radius: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
}

.empty-state :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 17, 203, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .game-invitations-container {
    padding: 15px;
    min-height: calc(100vh - 40px);
  }
  
  .game-invitations-container::before {
    height: 120px;
    border-radius: 0 0 30% 30% / 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 15px;
  }
  
  .page-header h1 {
    font-size: 22px;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .header-actions .el-button {
    flex: 1;
    padding: 10px;
    font-size: 14px;
  }
  
  /* 统计卡片移动端优化 */
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    margin-bottom: 10px;
    border-radius: 12px;
  }
  
  .stat-content {
    padding: 8px;
    gap: 12px;
  }
  
  .stat-icon {
    font-size: 24px;
    padding: 10px;
    border-radius: 10px;
  }
  
  .stat-value {
    font-size: 20px;
    margin-bottom: 2px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .stat-label::after {
    width: 20px;
    height: 2px;
  }
  
  /* 主内容区移动端优化 */
  .main-content {
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .main-content :deep(.el-tabs__header) {
    padding: 0 10px;
  }
  
  .main-content :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 12px 10px;
  }
  
  /* 邀请卡片移动端优化 */
  .invitations-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 5px;
  }
  
  .invitation-card {
    padding: 15px;
    border-radius: 12px;
  }
  
  .card-header h3 {
    font-size: 16px;
  }
  
  .card-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
  
  .receivers-list {
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .receiver-item {
    padding: 6px 8px;
  }
  
  .message {
    margin: 12px 0;
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .card-actions {
    margin-top: 12px;
    padding-top: 12px;
    gap: 8px;
  }
  
  .card-actions .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  /* 管理员表格视图优化 */
  .admin-controls .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  /* 空状态优化 */
  .empty-state {
    padding: 30px 0;
  }
  
  .empty-state :deep(.el-empty__image) {
    width: 80px;
    height: 80px;
  }
  
  .empty-state :deep(.el-button) {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  /* 移动端管理员视图优化 */
  .desktop-table {
    display: none;
  }
  
  .mobile-admin-cards {
    display: block;
  }
  
  /* 增强移动端图标样式 */
  .el-icon {
    transform: scale(1.2);
    margin-right: 8px;
  }
  
  .card-actions .el-icon {
    margin-right: 4px;
  }
}

/* 对话框样式 */
.invitation-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-right: 0;
}

.invitation-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.invitation-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.invitation-dialog :deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.invitation-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.invitation-form :deep(.el-input__wrapper),
.invitation-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.invitation-form :deep(.el-input__wrapper:hover),
.invitation-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.invitation-form :deep(.el-input__wrapper:focus-within),
.invitation-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px rgba(106, 17, 203, 0.3);
}

.user-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
}

.dialog-footer .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 17, 203, 0.3);
}

/* 超小屏幕设备优化 */
@media (max-width: 480px) {
  .game-invitations-container {
    padding: 10px;
  }
  
  .page-header {
    margin-bottom: 12px;
  }
  
  .page-header h1 {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .header-actions .el-button {
    padding: 10px 12px;
    font-size: 13px;
    height: auto;
    flex-basis: calc(50% - 4px);
    justify-content: center;
  }
  
  .header-actions .el-button .el-icon {
    margin-right: 6px;
    transform: scale(1.3);
  }
  
  .stats-row {
    margin-bottom: 15px;
  }
  
  .stat-card {
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
  }
  
  .stat-content {
    padding: 10px;
    gap: 10px;
  }
  
  .stat-icon {
    font-size: 22px;
    padding: 10px;
    border-radius: 10px;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 700;
  }
  
  .stat-label {
    font-size: 12px;
    font-weight: 500;
  }
  
  .invitation-card {
    padding: 15px;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  .card-header h3 {
    font-size: 16px;
    max-width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .message {
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 8px;
    border-left-width: 4px;
    margin: 12px 0;
  }
  
  .time-info {
    font-size: 12px;
    margin-top: 10px;
    opacity: 0.8;
  }
  
  .card-actions .el-button {
    padding: 8px 14px;
    font-size: 13px;
    height: auto;
    min-width: 70px;
  }
  
  .card-actions .el-button .el-icon {
    transform: scale(1.2);
    margin-right: 4px;
  }
  
  /* 移动端管理员视图优化 */
  .admin-controls .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }

  
  /* 移动端对话框优化 */
  .invitation-dialog :deep(.el-dialog) {
    width: 95% !important;
    max-width: 500px;
    margin: 8vh auto !important;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
  
  .invitation-dialog :deep(.el-dialog__header) {
    padding: 18px;
    background: linear-gradient(to right, rgba(106, 17, 203, 0.05), rgba(37, 117, 252, 0.05));
  }
  
  .invitation-dialog :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 700;
  }
  
  .invitation-dialog :deep(.el-dialog__body) {
    padding: 20px 18px;
  }
  
  .invitation-dialog :deep(.el-dialog__footer) {
    padding: 15px 18px;
  }
  
  .invitation-form :deep(.el-form-item__label) {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .invitation-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  .invitation-form :deep(.el-input__wrapper),
  .invitation-form :deep(.el-textarea__inner) {
    padding: 10px 15px;
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }
  
  .invitation-form :deep(.el-select) {
    width: 100%;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  
  .dialog-footer .el-button {
    padding: 10px 18px;
    font-size: 15px;
    flex: 1;
    margin: 0 5px;
    height: auto;
    border-radius: 12px;
  }
  
  .dialog-footer .el-button--primary {
    box-shadow: 0 5px 15px rgba(106, 17, 203, 0.3);
  }
  
  /* 移动端管理员视图优化 - 保持一致的显示逻辑 */
  .desktop-table {
    display: none;
  }
  
  .mobile-admin-cards {
    display: block;
  }
  
  .mobile-admin-card {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .mobile-admin-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #6a11cb, #2575fc);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .mobile-admin-card:hover::before {
    opacity: 1;
  }
  
  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .mobile-card-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    max-width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .mobile-card-content {
    margin-bottom: 12px;
  }
  
  .mobile-card-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  .mobile-card-label {
    color: #909399;
    margin-right: 8px;
    min-width: 70px;
  }
  
  .mobile-card-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  /* 超小屏幕设备优化 */
  @media (max-width: 480px) {
    .mobile-admin-card {
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
    
    .mobile-admin-card:hover {
      transform: translateY(-3px);
    }
    
    .mobile-admin-card::before {
      height: 5px;
    }
    
    .mobile-card-header {
      margin-bottom: 14px;
      padding-bottom: 10px;
    }
    
    .mobile-card-header h3 {
      font-size: 16px;
      max-width: 65%;
      font-weight: 600;
    }
    
    .mobile-card-item {
      font-size: 13px;
      margin-bottom: 10px;
      padding: 6px 8px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }
    
    .mobile-card-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .mobile-card-label {
      min-width: 70px;
      color: #606266;
      font-weight: 500;
    }
    
    .mobile-card-actions {
      padding-top: 12px;
      margin-top: 5px;
    }
    
    .mobile-card-actions .el-button {
      padding: 8px 14px;
      font-size: 13px;
      border-radius: 10px;
      height: auto;
    }
    
    .mobile-card-actions .el-button .el-icon {
      transform: scale(1.2);
      margin-right: 4px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-info .el-avatar {
      transform: scale(1.1);
    }
    
    .user-info span {
      max-width: 110px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }
  }
}
</style>