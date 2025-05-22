<template>
  <el-card class="create-invitation-card" shadow="never">
    <template #header>
      <div class="card-header">
        <h2>创建游戏邀约</h2>
      </div>
    </template>
    <el-form @submit.prevent="handleCreateInvitation" label-position="top">
      <el-form-item label="游戏名称" :required="true">
        <el-input id="gameName" v-model="gameName" placeholder="请输入游戏名称" clearable />
      </el-form-item>
      
      <el-form-item label="选择接收人" :required="true">
        <el-select
          v-model="selectedReceivers"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="搜索并选择用户"
          :remote-method="searchUsers"
          :loading="loadingUsers"
          style="width: 100%;"
          id="receivers"
        >
          <el-option
            v-for="user in users"
            :key="user._id"
            :label="`${user.name} (${user.username})`"
            :value="user._id"
          />
        </el-select>
        <div v-if="selectedReceivers.length > 0" class="selected-users-display">
          <p>已选择 {{ selectedReceivers.length }} 位接收人:</p>
          <el-tag
            v-for="receiverId in selectedReceivers"
            :key="receiverId"
            closable
            @close="removeReceiverById(receiverId)"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ getUserName(receiverId) }}
          </el-tag>
        </div>
        <p v-if="users.length === 0 && !loadingUsers && !initialLoadDone" class="info-text">
          正在加载用户列表...
        </p>
         <p v-if="users.length === 0 && !loadingUsers && initialLoadDone && !searchKeyword" class="info-text">
          暂无其他用户可选。
        </p>
      </el-form-item>
      
      <el-form-item label="留言 (可选)">
        <el-input
          id="message"
          type="textarea"
          v-model="message"
          placeholder="请输入留言内容"
          :rows="3"
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedReceivers.length === 0 || !gameName.trim()"
          class="submit-btn"
        >
          {{ isSubmitting ? '发送中...' : '发送邀约' }}
        </el-button>
      </el-form-item>
      
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
      <el-alert v-if="successMessage" :title="successMessage" type="success" show-icon :closable="false" />
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import gameInvitationService from '@/services/gameInvitationService';
// import userService from '@/services/userService'; // 引入userService (临时注释掉以排查问题)
import { useUserStore } from '@/stores/user'; // 引入用户store

const gameName = ref('');
const selectedReceivers = ref([]);
const message = ref('');
const allUsers = ref([]); // 存储从API获取的所有用户列表
const users = ref([]); // 用于在el-select中显示的用户列表（可能经过筛选）
const loadingUsers = ref(false);
const isSubmitting = ref(false);
const error = ref(null);
const successMessage = ref(null);
const userStore = useUserStore();
const initialLoadDone = ref(false);
const searchKeyword = ref('');

// 根据用户ID获取用户名称
const getUserName = (userId) => {
  const user = allUsers.value.find(u => u._id === userId);
  return user ? `${user.name} (${user.username})` : '未知用户';
};

// 通过ID移除选中的接收人
const removeReceiverById = (userIdToRemove) => {
  selectedReceivers.value = selectedReceivers.value.filter(id => id !== userIdToRemove);
};

/*
const fetchAllUsers = async () => {
  loadingUsers.value = true;
  error.value = null;
  try {
    const response = await userService.getAllUsers(); // 假设userService有getAllUsers方法
    // 过滤掉当前登录用户
    allUsers.value = response.data.filter(user => user._id !== userStore.userInfo?._id);
    users.value = [...allUsers.value]; // 初始时显示所有（已过滤的）用户
  } catch (err) {
    console.error('Failed to fetch users:', err);
    error.value = '无法加载用户列表。';
    allUsers.value = [];
    users.value = [];
  } finally {
    loadingUsers.value = false;
    initialLoadDone.value = true;
  }
};
*/

// Element Plus el-select的远程搜索方法
const searchUsers = (query) => {
  searchKeyword.value = query;
  if (query) {
    loadingUsers.value = true;
    setTimeout(() => { // 模拟异步搜索，真实场景可直接用API
      users.value = allUsers.value.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      loadingUsers.value = false;
    }, 200);
  } else {
    users.value = [...allUsers.value]; // 如果查询为空，显示所有用户
  }
};

onMounted(() => {
  // fetchAllUsers(); // 临时注释掉以排查问题
});

const handleCreateInvitation = async () => {
  if (selectedReceivers.value.length === 0) {
    error.value = '请至少选择一个接收人。';
    return;
  }
  isSubmitting.value = true;
  error.value = null;
  successMessage.value = null;

  const invitationData = {
    gameName: gameName.value,
    receivers: selectedReceivers.value,
    message: message.value,
  };

  try {
    const response = await gameInvitationService.createInvitation(invitationData);
    successMessage.value = `游戏邀约已成功发送给 ${selectedReceivers.value.length} 位接收人！`;
    // 清空表单
    gameName.value = '';
    selectedReceivers.value = [];
    message.value = '';
    console.log('Invitation created:', response);
  } catch (err) {
    console.error('Error creating invitation:', err);
    error.value = err.msg || err.message || '创建邀约失败，请稍后再试。';
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
.create-invitation-card {
  max-width: 700px;
  margin: 20px auto;
  padding: 10px; /* Reduced padding as el-card has its own */
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
  text-align: center;
}

.el-form-item {
  margin-bottom: 22px;
}

.submit-btn {
  width: 100%;
  padding: 12px 20px;
  font-size: 1em;
}

.selected-users-display {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
}

.selected-users-display p {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #666;
}

.info-text {
  font-size: 0.9em;
  color: #888;
  margin-top: 5px;
}

/* Ensure el-select dropdowns are not cut off if card has overflow hidden */
.el-select-dropdown {
  z-index: 2000 !important; 
}

.el-alert {
  margin-top: 20px;
}
</style>