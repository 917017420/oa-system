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
.user-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>