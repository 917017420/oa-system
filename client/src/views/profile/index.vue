<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router'; // 引入 useRouter
import { useUserStore } from '../../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 ElMessageBox
import apiClient from '../../apiClient'; // 引入 apiClient

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const router = useRouter(); // 引入 useRouter

// 头像上传相关
const avatarFile = ref(null);
const avatarPreviewUrl = ref(userInfo.value?.avatar || '');
const avatarUploading = ref(false);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const uploadAvatar = async () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择头像文件');
    return;
  }
  avatarUploading.value = true;
  const formData = new FormData();
  formData.append('avatar', avatarFile.value);

  try {
    const response = await apiClient.post(`/users/${userInfo.value.id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    userStore.updateUserAvatar(response.data.avatarUrl); // 更新store中的头像信息
    ElMessage.success('头像上传成功');
    avatarFile.value = null; // 清空选择的文件
  } catch (error) {
    console.error('头像上传失败:', error);
    const message = error.response?.data?.message || '头像上传失败，请稍后重试';
    ElMessage.error(message);
  } finally {
    avatarUploading.value = false;
  }
};

// 表单数据
const userForm = reactive({
  name: userInfo.value?.name || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
  avatar: userInfo.value?.avatar || '',
  department: userInfo.value?.department || '',
  position: userInfo.value?.position || ''
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单校验规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 表单引用
const userFormRef = ref(null);
const passwordFormRef = ref(null);
const avatarUploadInputRef = ref(null); // 新增 ref

// 加载状态
const loading = ref(false);
const passwordLoading = ref(false);

// 激活的标签页
const activeTab = ref('basic');

// 更新用户信息
const updateUserInfo = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 模拟API调用
        // const response = await axios.put('/api/users/profile', userForm);
        // 更新本地存储
        const updatedUser = { ...userInfo.value, ...userForm };
        userStore.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        ElMessage.success('个人信息更新成功');
      } catch (error) {
        console.error('更新个人信息失败:', error);
        ElMessage.error('更新个人信息失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true;
      try {
        await apiClient.put('/auth/update-password', {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });
        
        // 清空表单
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        ElMessage.success('密码修改成功，请重新登录');
        // 提示用户重新登录并执行登出操作
        await ElMessageBox.confirm(
          '密码已成功修改。为了您的账户安全，请重新登录。',
          '提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '稍后',
            type: 'success',
            center: true,
          }
        );
        // 执行登出操作
        userStore.logout();
        // 跳转到登录页
        // 注意: 此处直接操作 router 可能在 setup 中不可用，通常通过 useRouter 获取
        // 为了简单起见，这里假设 router 已正确配置并可用
        // 如果在实际项目中，确保 router 实例的正确获取和使用
        router.push('/login'); // 使用 router.push

      } catch (error) {
        console.error('修改密码失败:', error);
        const message = error.response?.data?.message || '修改密码失败，请稍后重试';
        ElMessage.error(message);
      } finally {
        passwordLoading.value = false;
      }
    }
  });
};

const triggerAvatarUpload = () => {
  if (avatarUploadInputRef.value) {
    avatarUploadInputRef.value.click();
  }
};
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人中心</h3>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="profile-content">
            <div class="avatar-container">
              <el-avatar :size="100" :src="avatarPreviewUrl || userInfo?.avatar || ''">
                {{ userInfo?.name?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="avatar-actions">
                <input type="file" @change="handleFileChange" accept="image/*" style="display: none" ref="avatarUploadInputRef" />
                <el-button type="primary" size="small" @click="triggerAvatarUpload">选择图片</el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="uploadAvatar" 
                  :loading="avatarUploading" 
                  :disabled="!avatarFile || avatarUploading"
                  v-if="avatarFile"
                >
                  上传头像
                </el-button>
              </div>
            </div>
            
            <el-form
              ref="userFormRef"
              :model="userForm"
              label-width="100px"
              class="user-form"
            >
              <el-form-item label="姓名" prop="name">
                <el-input v-model="userForm.name" />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" />
              </el-form-item>
              
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userForm.phone" />
              </el-form-item>
              
              <el-form-item label="部门" prop="department">
                <el-input v-model="userForm.department" disabled />
              </el-form-item>
              
              <el-form-item label="职位" prop="position">
                <el-input v-model="userForm.position" disabled />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" :loading="loading" @click="updateUserInfo">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="updatePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
/* 个人资料容器 */
.profile-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  position: relative;
}

.profile-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
  z-index: 0;
}

.profile-container > * {
  position: relative;
  z-index: 1;
}

/* 个人资料卡片 */
.profile-card {
  margin-bottom: 24px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  position: relative;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
  z-index: 1;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.profile-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  position: relative;
  z-index: 2;
}

.profile-card :deep(.el-card__body) {
  padding: 28px;
  position: relative;
  z-index: 2;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3::before {
  content: '👤';
  font-size: 28px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 标签页样式 */
.profile-card :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.profile-card :deep(.el-tabs__nav-wrap) {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 4px;
}

.profile-card :deep(.el-tabs__item) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 0 4px;
}

.profile-card :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-card :deep(.el-tabs__active-bar) {
  display: none;
}

/* 个人资料内容 */
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头像容器 */
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}

.avatar-container :deep(.el-avatar) {
  border: 4px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 36px;
  font-weight: 700;
}

.avatar-container :deep(.el-avatar:hover) {
  transform: scale(1.05);
  border-color: #667eea;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
}

.avatar-actions {
  margin-top: 16px;
}

.avatar-actions :deep(.el-button) {
  border-radius: 20px;
  font-weight: 600;
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.avatar-actions :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

/* 表单样式 */
.user-form,
.password-form {
  width: 100%;
  max-width: 500px;
}

.user-form :deep(.el-form-item),
.password-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.user-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.user-form :deep(.el-input__wrapper),
.password-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.user-form :deep(.el-input__wrapper:hover),
.password-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.user-form :deep(.el-input__wrapper.is-focus),
.password-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.user-form :deep(.el-input__inner),
.password-form :deep(.el-input__inner) {
  font-weight: 500;
  color: #2c3e50;
}

.user-form :deep(.el-input.is-disabled .el-input__wrapper),
.password-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background: rgba(248, 249, 250, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}

.user-form :deep(.el-input.is-disabled .el-input__inner),
.password-form :deep(.el-input.is-disabled .el-input__inner) {
  color: #6c757d;
}

/* 表单按钮 */
.user-form :deep(.el-button),
.password-form :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 32px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-form :deep(.el-button--primary),
.password-form :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.user-form :deep(.el-button--primary::before),
.password-form :deep(.el-button--primary::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.user-form :deep(.el-button--primary:hover),
.password-form :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.user-form :deep(.el-button--primary:hover::before),
.password-form :deep(.el-button--primary:hover::before) {
  left: 100%;
}

.user-form :deep(.el-button--primary:active),
.password-form :deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* 密码输入框图标 */
.password-form :deep(.el-input__suffix) {
  color: #667eea;
}

.password-form :deep(.el-input__password) {
  color: #667eea;
  transition: all 0.3s ease;
}

.password-form :deep(.el-input__password:hover) {
  color: #764ba2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .profile-card {
    border-radius: 16px;
  }
  
  .profile-card :deep(.el-card__header) {
    padding: 16px 20px;
  }
  
  .profile-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .card-header h3 {
    font-size: 20px;
  }
  
  .card-header h3::before {
    font-size: 24px;
  }
  
  .avatar-container :deep(.el-avatar) {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }
  
  .user-form,
  .password-form {
    max-width: 100%;
  }
  
  .profile-card :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 12px;
  }
  
  .profile-card :deep(.el-card__header) {
    padding: 12px 16px;
  }
  
  .profile-card :deep(.el-card__body) {
    padding: 16px;
  }
  
  .card-header h3 {
    font-size: 18px;
  }
  
  .avatar-container :deep(.el-avatar) {
    width: 70px;
    height: 70px;
    font-size: 24px;
  }
  
  .avatar-actions :deep(.el-button) {
    padding: 6px 16px;
    font-size: 14px;
  }
  
  .user-form :deep(.el-form-item),
  .password-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .user-form :deep(.el-button),
  .password-form :deep(.el-button) {
    width: 100%;
    padding: 10px 24px;
  }
  
  .profile-card :deep(.el-tabs__nav-wrap) {
    padding: 2px;
  }
  
  .profile-card :deep(.el-tabs__item) {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>