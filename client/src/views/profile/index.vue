<script setup>
import { ref, reactive, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

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
        // 模拟API调用
        // const response = await axios.put('/api/users/password', {
        //   oldPassword: passwordForm.oldPassword,
        //   newPassword: passwordForm.newPassword
        // });
        
        // 清空表单
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        ElMessage.success('密码修改成功');
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败，请稍后重试');
      } finally {
        passwordLoading.value = false;
      }
    }
  });
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
              <el-avatar :size="100" :src="userInfo?.avatar || ''">
                {{ userInfo?.name?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="avatar-actions">
                <el-button type="primary" size="small">更换头像</el-button>
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
.profile-container {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-actions {
  margin-top: 15px;
}

.user-form,
.password-form {
  width: 100%;
  max-width: 500px;
}
</style>