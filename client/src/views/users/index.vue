<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../../stores/user';
import userService from '../../services/userService'; // 新增导入

const userStore = useUserStore();

// 用户列表
const userList = ref([]);

// 加载状态
const loading = ref(false);

// 搜索条件
const searchForm = reactive({
  keyword: '',
  departmentId: '',
  status: ''
});

// 部门列表
const departmentOptions = ref([]);

// 用户状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: '1', label: '正常' },
  { value: '0', label: '禁用' }
];

// 角色列表
const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '部门经理' },
  { value: 'employee', label: '普通员工' }
];

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 用户对话框
const userDialogVisible = ref(false);
const dialogTitle = ref('添加用户');

// 用户表单
const userForm = reactive({
  id: null,
  username: '',
  name: '',
  password: '',
  email: '',
  phone: '',
  departmentId: '',
  position: '',
  roles: [],
  status: '1'
});

// 表单校验规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    // 编辑时密码非必填，新增时必填
    // { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' }
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

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await userService.getAllUsers(); // 调用 userService 获取用户
    // 假设后端返回的数据直接是用户数组，或者包含在 response.data 中
    // 如果后端API支持分页和过滤，需要传递 pagination 和 searchForm 中的参数
    // 例如: const response = await userService.getAllUsers({ 
    //   page: pagination.currentPage, 
    //   size: pagination.pageSize, 
    //   ...searchForm 
    // });

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        userList.value = response.data;
        pagination.total = response.data.length; // 如果后端不返回 total，前端自行计算或处理
      } else if (response.data.data && typeof response.data.total !== 'undefined') { // 假设后端返回 { data: [], total: number }
        userList.value = response.data.data;
        pagination.total = response.data.total;
      } else {
        // Fallback or error handling if data structure is unexpected
        userList.value = [];
        pagination.total = 0;
        console.warn('Unexpected data structure from API for user list:', response.data);
        ElMessage.warning('获取用户列表数据格式不正确');
      }
    } else {
      userList.value = [];
      pagination.total = 0;
      ElMessage.warning('未能获取到用户列表数据');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error(error.response?.data?.message || error.message || '获取用户列表失败，请稍后重试');
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取部门列表
const fetchDepartments = async () => {
  try {
    // 模拟API调用
    // const response = await axios.get('/api/departments/all');
    // departmentOptions.value = response.data;
    
    // 模拟数据
    departmentOptions.value = [
      { id: 1, name: '总经办' },
      { id: 2, name: '人力资源部' },
      { id: 3, name: '财务部' },
      { id: 4, name: '技术部' },
      { id: 5, name: '市场部' }
    ];
  } catch (error) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表失败，请稍后重试');
  }
};

// 搜索用户
const handleSearch = () => {
  pagination.currentPage = 1;
  fetchUsers();
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.departmentId = '';
  searchForm.status = '';
  handleSearch();
};

// 页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchUsers();
};

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchUsers();
};

// 打开添加用户对话框
const openAddDialog = () => {
  dialogTitle.value = '添加用户';
  userDialogVisible.value = true;
  // 重置表单
  resetForm();
  // 新增用户时，密码为必填项
  if (userRules.password) {
    userRules.password[0].required = true;
  }
};

// 打开编辑用户对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑用户';
  userDialogVisible.value = true;
  // 编辑用户时，密码为非必填项
  if (userRules.password) {
    userRules.password[0].required = false;
  }
  // 填充表单数据
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    password: '', // 编辑时不回显密码
    email: row.email,
    phone: row.phone,
    departmentId: row.departmentId,
    position: row.position,
    roles: row.roles,
    status: row.status
  });
};

// 关闭对话框
const closeDialog = () => {
  userDialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  userForm.id = null;
  userForm.username = '';
  userForm.name = '';
  userForm.password = '';
  userForm.email = '';
  userForm.phone = '';
  userForm.departmentId = '';
  userForm.position = '';
  userForm.roles = [];
  userForm.status = '1';
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (userForm.id) {
          // 编辑用户
          // 模拟API调用
          // await axios.put(`/api/users/${userForm.id}`, userForm);
          ElMessage.success('用户更新成功');
        } else {
          // 添加用户
          // 模拟API调用
          // await axios.post('/api/users', userForm);
          ElMessage.success('用户添加成功');
        }
        
        // 关闭对话框并刷新列表
        closeDialog();
        fetchUsers();
      } catch (error) {
        console.error('提交用户信息失败:', error);
        ElMessage.error('提交用户信息失败，请稍后重试');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 删除用户
const deleteUser = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.name}"?`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      // await axios.delete(`/api/users/${row.id}`);
      
      ElMessage.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败，请稍后重试');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 修改用户状态
const changeUserStatus = async (row) => {
  try {
    // 模拟API调用
    // await axios.put(`/api/users/${row.id}/status`, {
    //   status: row.status === '1' ? '0' : '1'
    // });
    
    ElMessage.success(`用户${row.status === '1' ? '禁用' : '启用'}成功`);
    fetchUsers();
  } catch (error) {
    console.error('修改用户状态失败:', error);
    ElMessage.error('修改用户状态失败，请稍后重试');
  }
};

// 重置密码
const resetPassword = (row) => {
  ElMessageBox.confirm(
    `确定要重置用户 "${row.name}" 的密码?`,
    '重置密码确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      // await axios.post(`/api/users/${row.id}/reset-password`);
      
      ElMessage.success('密码重置成功，新密码已发送至用户邮箱');
    } catch (error) {
      console.error('重置密码失败:', error);
      ElMessage.error('重置密码失败，请稍后重试');
    }
  }).catch(() => {
    // 取消重置
  });
};

// 格式化角色名称
const formatRoles = (roles) => {
  if (!roles || !roles.length) return '';
  return roles.map(role => {
    const roleObj = roleOptions.find(item => item.value === role);
    return roleObj ? roleObj.label : role;
  }).join(', ');
};

// 检查权限
const checkPermission = (permission) => {
  return userStore.hasPermission(permission);
};

onMounted(() => {
  fetchUsers();
  fetchDepartments();
});
</script>

<template>
  <div class="user-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/姓名/邮箱/手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="部门">
          <el-select v-model="searchForm.departmentId" placeholder="全部部门" clearable>
            <el-option
              v-for="item in departmentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>
    
    <!-- 用户列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
      >
        <el-table-column prop="username" label="用户名" min-width="120" />
        
        <el-table-column prop="name" label="姓名" width="120" />
        
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="phone" label="手机号" width="120" />
        
        <el-table-column prop="departmentName" label="部门" width="120" />
        
        <el-table-column prop="position" label="职位" width="120" />
        
        <el-table-column prop="roleNames" label="角色" width="120" />
        
        <el-table-column prop="statusName" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openEditDialog(scope.row)"
            >
              编辑
            </el-button>
            
            <el-button
              :type="scope.row.status === '1' ? 'warning' : 'success'"
              size="small"
              @click="changeUserStatus(scope.row)"
            >
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            
            <el-dropdown>
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="resetPassword(scope.row)">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteUser(scope.row)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="!!userForm.id" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
          <div v-if="userForm.id" class="form-tip">不修改密码请留空</div>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="userForm.departmentId" placeholder="请选择部门" style="width: 100%">
            <el-option
              v-for="item in departmentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="职位" prop="position">
          <el-input v-model="userForm.position" placeholder="请输入职位" />
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
        
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
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
/* 用户管理容器 */
.user-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  position: relative;
}

.user-container::before {
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

.user-container > * {
  position: relative;
  z-index: 1;
}

/* 搜索卡片 */
.search-card {
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

.search-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.search-card :deep(.el-card__body) {
  padding: 28px;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 20px;
}

.search-card :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.search-card :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.search-card :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.search-card :deep(.el-select) {
  width: 100%;
}

.search-card :deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}

.search-card :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-card :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.search-card :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.search-card :deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e0e6ed;
  color: #6c757d;
}

.search-card :deep(.el-button--default:hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 操作栏 */
.action-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
}

.action-bar :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.action-bar :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.action-bar :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

/* 表格卡片 */
.user-container > .el-card:last-of-type {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  position: relative;
}

.user-container > .el-card:last-of-type::before {
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

.user-container > .el-card:last-of-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.user-container > .el-card:last-of-type :deep(.el-card__body) {
  padding: 28px;
  position: relative;
  z-index: 2;
}

/* 表格样式 */
.user-container :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.user-container :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-container :deep(.el-table__header th) {
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  padding: 16px 12px;
}

.user-container :deep(.el-table__body tr) {
  transition: all 0.3s ease;
}

.user-container :deep(.el-table__body tr:hover) {
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.01);
}

.user-container :deep(.el-table__body td) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 12px;
  font-weight: 500;
}

.user-container :deep(.el-tag) {
  border-radius: 20px;
  font-weight: 600;
  padding: 4px 12px;
  border: none;
}

.user-container :deep(.el-tag--success) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.user-container :deep(.el-tag--danger) {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: white;
}

.user-container :deep(.el-tag--warning) {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: white;
}

.user-container :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 0 2px;
}

.user-container :deep(.el-button--primary) {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
}

.user-container :deep(.el-button--warning) {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  border: none;
}

.user-container :deep(.el-button--success) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
}

.user-container :deep(.el-button:hover) {
  transform: translateY(-1px);
}

/* 分页容器 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container :deep(.el-pagination) {
  justify-content: center;
}

.pagination-container :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

.pagination-container :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pagination-container :deep(.el-pagination .btn-prev),
.pagination-container :deep(.el-pagination .btn-next) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* 对话框样式 */
.user-container :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.user-container :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.user-container :deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 18px;
}

.user-container :deep(.el-dialog__body) {
  padding: 24px;
}

.user-container :deep(.el-form-item) {
  margin-bottom: 20px;
}

.user-container :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.user-container :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
}

.user-container :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.user-container :deep(.el-select) {
  width: 100%;
}

.user-container :deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}

.user-container :deep(.dialog-footer .el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  margin-left: 12px;
  transition: all 0.3s ease;
}

.user-container :deep(.dialog-footer .el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.user-container :deep(.dialog-footer .el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.user-container :deep(.dialog-footer .el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e0e6ed;
  color: #6c757d;
}

.user-container :deep(.dialog-footer .el-button--default:hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-container {
    padding: 16px;
  }
  
  .search-card,
  .user-container > .el-card:last-of-type {
    border-radius: 16px;
  }
  
  .search-card :deep(.el-card__body),
  .user-container > .el-card:last-of-type :deep(.el-card__body) {
    padding: 20px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .user-container :deep(.el-table__header th) {
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .user-container :deep(.el-table__body td) {
    padding: 12px 8px;
    font-size: 14px;
  }
  
  .user-container :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .pagination-container {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .user-container {
    padding: 12px;
  }
  
  .search-card :deep(.el-card__body),
  .user-container > .el-card:last-of-type :deep(.el-card__body) {
    padding: 16px;
  }
  
  .user-container :deep(.el-dialog) {
    width: 95vw;
    margin: 0;
  }
  
  .user-container :deep(.dialog-footer) {
    text-align: center;
  }
  
  .user-container :deep(.dialog-footer .el-button) {
    width: 100%;
    margin: 8px 0 0 0;
  }
}
</style>