<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

// 工作流列表
const workflowList = ref([]);

// 加载状态
const loading = ref(false);

// 搜索条件
const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: []
});

// 工作流状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'rejected', label: '已拒绝' }
];

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 工作流详情对话框
const detailDialogVisible = ref(false);
const currentWorkflow = ref(null);

// 审批表单
const approvalForm = reactive({
  comment: '',
  result: ''
});

// 表单校验规则
const approvalRules = {
  comment: [
    { required: true, message: '请输入审批意见', trigger: 'blur' },
    { max: 200, message: '审批意见不能超过200个字符', trigger: 'blur' }
  ],
  result: [
    { required: true, message: '请选择审批结果', trigger: 'change' }
  ]
};

// 表单引用
const approvalFormRef = ref(null);

// 审批状态
const approvalLoading = ref(false);

// 创建工作流对话框
const createDialogVisible = ref(false);

// 创建工作流表单
const createForm = reactive({
  title: '',
  type: '',
  content: '',
  attachments: []
});

// 工作流类型选项
const workflowTypes = [
  { value: 'leave', label: '请假申请' },
  { value: 'expense', label: '报销申请' },
  { value: 'purchase', label: '采购申请' },
  { value: 'travel', label: '出差申请' },
  { value: 'other', label: '其他申请' }
];

// 创建表单校验规则
const createRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择工作流类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入申请内容', trigger: 'blur' }
  ]
};

// 创建表单引用
const createFormRef = ref(null);

// 创建状态
const createLoading = ref(false);

// 获取工作流列表
const fetchWorkflows = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    // const response = await axios.get('/api/workflows', {
    //   params: {
    //     page: pagination.currentPage,
    //     size: pagination.pageSize,
    //     keyword: searchForm.keyword,
    //     status: searchForm.status,
    //     startDate: searchForm.dateRange[0],
    //     endDate: searchForm.dateRange[1]
    //   }
    // });
    
    // 模拟数据
    setTimeout(() => {
      workflowList.value = [
        {
          id: 1,
          title: '年假申请',
          type: 'leave',
          typeName: '请假申请',
          content: '申请2023年12月25日至2023年12月29日休年假5天',
          status: 'pending',
          statusName: '待处理',
          creator: '张三',
          createTime: '2023-12-15 10:30:00',
          currentHandler: '李四',
          updateTime: '2023-12-15 10:30:00'
        },
        {
          id: 2,
          title: '办公用品采购',
          type: 'purchase',
          typeName: '采购申请',
          content: '申请采购打印纸50包，签字笔100支',
          status: 'processing',
          statusName: '处理中',
          creator: '王五',
          createTime: '2023-12-14 14:20:00',
          currentHandler: '赵六',
          updateTime: '2023-12-14 16:15:00'
        },
        {
          id: 3,
          title: '差旅费报销',
          type: 'expense',
          typeName: '报销申请',
          content: '申请报销上海出差费用共计3580元',
          status: 'completed',
          statusName: '已完成',
          creator: '李四',
          createTime: '2023-12-10 09:45:00',
          currentHandler: '已完成',
          updateTime: '2023-12-12 11:30:00'
        },
        {
          id: 4,
          title: '北京客户拜访',
          type: 'travel',
          typeName: '出差申请',
          content: '申请2023年12月20日至2023年12月22日前往北京拜访客户',
          status: 'rejected',
          statusName: '已拒绝',
          creator: '赵六',
          createTime: '2023-12-08 16:40:00',
          currentHandler: '已拒绝',
          updateTime: '2023-12-09 10:20:00'
        },
        {
          id: 5,
          title: '团建活动申请',
          type: 'other',
          typeName: '其他申请',
          content: '申请组织部门团建活动，预算5000元',
          status: 'pending',
          statusName: '待处理',
          creator: '王五',
          createTime: '2023-12-05 11:30:00',
          currentHandler: '张三',
          updateTime: '2023-12-05 11:30:00'
        }
      ];
      pagination.total = 5;
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('获取工作流列表失败:', error);
    ElMessage.error('获取工作流列表失败，请稍后重试');
    loading.value = false;
  }
};

// 搜索工作流
const handleSearch = () => {
  pagination.currentPage = 1;
  fetchWorkflows();
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
};

// 页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchWorkflows();
};

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchWorkflows();
};

// 查看工作流详情
const viewWorkflowDetail = (row) => {
  currentWorkflow.value = row;
  detailDialogVisible.value = true;
  
  // 重置审批表单
  approvalForm.comment = '';
  approvalForm.result = '';
  if (approvalFormRef.value) {
    approvalFormRef.value.resetFields();
  }
};

// 关闭详情对话框
const closeDetailDialog = () => {
  detailDialogVisible.value = false;
  currentWorkflow.value = null;
};

// 提交审批
const submitApproval = async () => {
  if (!approvalFormRef.value || !currentWorkflow.value) return;
  
  await approvalFormRef.value.validate(async (valid) => {
    if (valid) {
      approvalLoading.value = true;
      try {
        // 模拟API调用
        // const response = await axios.post(`/api/workflows/${currentWorkflow.value.id}/approve`, {
        //   comment: approvalForm.comment,
        //   result: approvalForm.result
        // });
        
        // 模拟审批成功
        setTimeout(() => {
          approvalLoading.value = false;
          closeDetailDialog();
          ElMessage.success('审批提交成功');
          fetchWorkflows();
        }, 1000);
      } catch (error) {
        console.error('提交审批失败:', error);
        ElMessage.error('提交审批失败，请稍后重试');
        approvalLoading.value = false;
      }
    }
  });
};

// 打开创建工作流对话框
const openCreateDialog = () => {
  createDialogVisible.value = true;
  // 重置表单
  createForm.title = '';
  createForm.type = '';
  createForm.content = '';
  createForm.attachments = [];
  if (createFormRef.value) {
    createFormRef.value.resetFields();
  }
};

// 关闭创建对话框
const closeCreateDialog = () => {
  createDialogVisible.value = false;
};

// 文件上传成功回调
const handleFileSuccess = (response, file, fileList) => {
  createForm.attachments = fileList;
  ElMessage.success('文件上传成功');
};

// 文件上传前检查
const beforeFileUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return true;
};

// 提交创建表单
const submitCreate = async () => {
  if (!createFormRef.value) return;
  
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      createLoading.value = true;
      try {
        // 模拟API调用
        // const formData = new FormData();
        // formData.append('title', createForm.title);
        // formData.append('type', createForm.type);
        // formData.append('content', createForm.content);
        // createForm.attachments.forEach(file => {
        //   formData.append('attachments', file.raw);
        // });
        // const response = await axios.post('/api/workflows', formData);
        
        // 模拟创建成功
        setTimeout(() => {
          createLoading.value = false;
          closeCreateDialog();
          ElMessage.success('工作流创建成功');
          fetchWorkflows();
        }, 1000);
      } catch (error) {
        console.error('创建工作流失败:', error);
        ElMessage.error('创建工作流失败，请稍后重试');
        createLoading.value = false;
      }
    }
  });
};

// 删除工作流
const deleteWorkflow = (row) => {
  ElMessageBox.confirm(
    `确定要删除工作流 "${row.title}"?`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      // await axios.delete(`/api/workflows/${row.id}`);
      
      ElMessage.success('工作流删除成功');
      fetchWorkflows();
    } catch (error) {
      console.error('删除工作流失败:', error);
      ElMessage.error('删除工作流失败，请稍后重试');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 格式化工作流状态
const formatStatus = (status) => {
  const statusObj = statusOptions.find(item => item.value === status);
  return statusObj ? statusObj.label : '未知状态';
};

// 格式化工作流类型
const formatType = (type) => {
  const typeObj = workflowTypes.find(item => item.value === type);
  return typeObj ? typeObj.label : '未知类型';
};

// 检查权限
const checkPermission = (permission) => {
  return userStore.hasPermission(permission);
};

// 检查是否可以审批
const canApprove = (workflow) => {
  // 只有待处理状态且当前处理人是自己的工作流才能审批
  return workflow.status === 'pending' && workflow.currentHandler === userInfo.value?.name;
};

// 用户信息
const userInfo = ref(userStore.userInfo);

onMounted(() => {
  fetchWorkflows();
});
</script>

<template>
  <div class="workflow-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标题/创建人"
            clearable
            @keyup.enter="handleSearch"
          />
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
        
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        发起申请
      </el-button>
    </div>
    
    <!-- 工作流列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="workflowList"
        style="width: 100%"
        border
      >
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="typeName" label="类型" width="120" />
        
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'completed' ? 'success' : 
                    scope.row.status === 'rejected' ? 'danger' : 
                    scope.row.status === 'processing' ? 'warning' : 'info'"
            >
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="creator" label="创建人" width="100" />
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column prop="currentHandler" label="当前处理人" width="120" />
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="viewWorkflowDetail(scope.row)"
            >
              查看
            </el-button>
            
            <el-button
              v-if="scope.row.status === 'pending' && scope.row.creator === userInfo?.name"
              type="danger"
              size="small"
              @click="deleteWorkflow(scope.row)"
            >
              撤回
            </el-button>
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
    
    <!-- 工作流详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="工作流详情"
      width="600px"
      @close="closeDetailDialog"
    >
      <div v-if="currentWorkflow" class="workflow-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentWorkflow.title }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ currentWorkflow.typeName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="currentWorkflow.status === 'completed' ? 'success' : 
                    currentWorkflow.status === 'rejected' ? 'danger' : 
                    currentWorkflow.status === 'processing' ? 'warning' : 'info'"
            >
              {{ currentWorkflow.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentWorkflow.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentWorkflow.createTime }}</el-descriptions-item>
          <el-descriptions-item label="当前处理人">{{ currentWorkflow.currentHandler }}</el-descriptions-item>
          <el-descriptions-item label="申请内容">{{ currentWorkflow.content }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 审批表单 -->
        <div v-if="currentWorkflow.status === 'pending' && currentWorkflow.currentHandler === userInfo?.name" class="approval-form">
          <el-divider>审批操作</el-divider>
          
          <el-form
            ref="approvalFormRef"
            :model="approvalForm"
            :rules="approvalRules"
            label-width="80px"
          >
            <el-form-item label="审批结果" prop="result">
              <el-radio-group v-model="approvalForm.result">
                <el-radio label="approve">同意</el-radio>
                <el-radio label="reject">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="审批意见" prop="comment">
              <el-input
                v-model="approvalForm.comment"
                type="textarea"
                :rows="3"
                placeholder="请输入审批意见"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetailDialog">关闭</el-button>
          <el-button
            v-if="currentWorkflow && currentWorkflow.status === 'pending' && currentWorkflow.currentHandler === userInfo?.name"
            type="primary"
            :loading="approvalLoading"
            @click="submitApproval"
          >
            提交审批
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 创建工作流对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="发起申请"
      width="600px"
      @close="closeCreateDialog"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择申请类型" style="width: 100%">
            <el-option
              v-for="item in workflowTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="申请内容" prop="content">
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入申请内容"
          />
        </el-form-item>
        
        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="5"
            :on-success="handleFileSuccess"
            :before-upload="beforeFileUpload"
            :http-request="() => {}"
            multiple
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                文件大小不超过10MB，最多上传5个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeCreateDialog">取消</el-button>
          <el-button type="primary" :loading="createLoading" @click="submitCreate">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.workflow-container {
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

.workflow-detail {
  margin-bottom: 20px;
}

.approval-form {
  margin-top: 20px;
}

.upload-demo {
  width: 100%;
}
</style>