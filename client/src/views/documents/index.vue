<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

// 文档列表
const documentList = ref([]);

// 加载状态
const loading = ref(false);

// 搜索条件
const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: []
});

// 文档类型选项
const documentTypes = [
  { value: '', label: '全部类型' },
  { value: 'contract', label: '合同文档' },
  { value: 'report', label: '报告文档' },
  { value: 'plan', label: '计划文档' },
  { value: 'notice', label: '通知公告' },
  { value: 'other', label: '其他文档' }
];

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 文档上传对话框
const uploadDialogVisible = ref(false);

// 上传表单
const uploadForm = reactive({
  title: '',
  type: '',
  description: '',
  file: null
});

// 表单校验规则
const uploadRules = {
  title: [
    { required: true, message: '请输入文档标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择文档类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
};

// 表单引用
const uploadFormRef = ref(null);

// 上传状态
const uploadLoading = ref(false);

// 获取文档列表
const fetchDocuments = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    // const response = await axios.get('/api/documents', {
    //   params: {
    //     page: pagination.currentPage,
    //     size: pagination.pageSize,
    //     keyword: searchForm.keyword,
    //     type: searchForm.type,
    //     startDate: searchForm.dateRange[0],
    //     endDate: searchForm.dateRange[1]
    //   }
    // });
    
    // 模拟数据
    setTimeout(() => {
      documentList.value = [
        {
          id: 1,
          title: '2023年度销售合同',
          type: 'contract',
          typeName: '合同文档',
          size: '1.2MB',
          creator: '张三',
          createTime: '2023-12-15 10:30:00',
          updateTime: '2023-12-15 10:30:00',
          downloads: 5
        },
        {
          id: 2,
          title: '2023年Q4季度报告',
          type: 'report',
          typeName: '报告文档',
          size: '2.5MB',
          creator: '李四',
          createTime: '2023-12-10 14:20:00',
          updateTime: '2023-12-12 09:15:00',
          downloads: 12
        },
        {
          id: 3,
          title: '2024年营销计划',
          type: 'plan',
          typeName: '计划文档',
          size: '1.8MB',
          creator: '王五',
          createTime: '2023-12-05 16:45:00',
          updateTime: '2023-12-08 11:30:00',
          downloads: 8
        },
        {
          id: 4,
          title: '员工手册V2.0',
          type: 'notice',
          typeName: '通知公告',
          size: '3.1MB',
          creator: '赵六',
          createTime: '2023-11-28 09:00:00',
          updateTime: '2023-11-28 09:00:00',
          downloads: 25
        },
        {
          id: 5,
          title: '产品设计规范',
          type: 'other',
          typeName: '其他文档',
          size: '5.7MB',
          creator: '张三',
          createTime: '2023-11-20 13:40:00',
          updateTime: '2023-11-22 10:20:00',
          downloads: 18
        }
      ];
      pagination.total = 5;
      loading.value = false;
    }, 500);
  } catch (error) {
    console.error('获取文档列表失败:', error);
    ElMessage.error('获取文档列表失败，请稍后重试');
    loading.value = false;
  }
};

// 搜索文档
const handleSearch = () => {
  pagination.currentPage = 1;
  fetchDocuments();
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.type = '';
  searchForm.dateRange = [];
  handleSearch();
};

// 页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchDocuments();
};

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchDocuments();
};

// 打开上传对话框
const openUploadDialog = () => {
  uploadDialogVisible.value = true;
  // 重置表单
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }
  uploadForm.title = '';
  uploadForm.type = '';
  uploadForm.description = '';
  uploadForm.file = null;
};

// 关闭上传对话框
const closeUploadDialog = () => {
  uploadDialogVisible.value = false;
};

// 文件上传成功回调
const handleFileSuccess = (response, file) => {
  uploadForm.file = file.raw;
  ElMessage.success('文件上传成功');
};

// 文件上传前检查
const beforeFileUpload = (file) => {
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isLt20M) {
    ElMessage.error('文件大小不能超过 20MB!');
    return false;
  }
  return true;
};

// 提交上传表单
const submitUpload = async () => {
  if (!uploadFormRef.value) return;
  
  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!uploadForm.file) {
        ElMessage.warning('请先上传文件');
        return;
      }
      
      uploadLoading.value = true;
      try {
        // 模拟API调用
        // const formData = new FormData();
        // formData.append('title', uploadForm.title);
        // formData.append('type', uploadForm.type);
        // formData.append('description', uploadForm.description);
        // formData.append('file', uploadForm.file);
        // const response = await axios.post('/api/documents', formData);
        
        // 模拟上传成功
        setTimeout(() => {
          uploadLoading.value = false;
          closeUploadDialog();
          ElMessage.success('文档上传成功');
          fetchDocuments();
        }, 1000);
      } catch (error) {
        console.error('上传文档失败:', error);
        ElMessage.error('上传文档失败，请稍后重试');
        uploadLoading.value = false;
      }
    }
  });
};

// 下载文档
const downloadDocument = (row) => {
  // 模拟下载
  ElMessage.success(`开始下载文档：${row.title}`);
};

// 删除文档
const deleteDocument = (row) => {
  ElMessageBox.confirm(
    `确定要删除文档「${row.title}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    // axios.delete(`/api/documents/${row.id}`)
    
    // 模拟删除成功
    ElMessage.success('删除成功');
    fetchDocuments();
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchDocuments();
});
</script>

<template>
  <div class="document-management">
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入文档标题或描述"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择文档类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in documentTypes"
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
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 文档表格 -->
    <div class="document-table">
      <div class="table-header">
        <h3>文档列表</h3>
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Plus /></el-icon>
          上传文档
        </el-button>
      </div>

      <el-table
        :data="documentList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="title" label="文档标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="downloadDocument(row)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="文档类型" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'contract' ? 'success' : 
                     row.type === 'report' ? 'warning' : 
                     row.type === 'plan' ? 'info' : 
                     row.type === 'notice' ? 'danger' : ''"
            >
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="100">
          <template #default="{ row }">
            <span class="file-size">{{ row.size }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="downloads" label="下载次数" width="100" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <div class="document-actions">
              <el-button
                type="primary"
                size="small"
                @click="downloadDocument(row)"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="downloadDocument(row)"
              >
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteDocument(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文档"
      width="600px"
      :before-close="closeUploadDialog"
    >
      <div class="upload-form">
        <el-form
          ref="uploadFormRef"
          :model="uploadForm"
          :rules="uploadRules"
          label-width="80px"
        >
          <el-form-item label="文档标题" prop="title">
            <el-input
              v-model="uploadForm.title"
              placeholder="请输入文档标题"
              clearable
            />
          </el-form-item>
          <el-form-item label="文档类型" prop="type">
            <el-select
              v-model="uploadForm.type"
              placeholder="请选择文档类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in documentTypes.slice(1)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文档描述" prop="description">
            <el-input
              v-model="uploadForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入文档描述（可选）"
            />
          </el-form-item>
          <el-form-item label="上传文件">
            <el-upload
              class="upload-demo"
              drag
              :auto-upload="false"
              :on-change="handleFileSuccess"
              :before-upload="beforeFileUpload"
              :limit="1"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 pdf/doc/docx/xls/xlsx/ppt/pptx/txt 格式，文件大小不超过 20MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="form-footer">
        <el-button @click="closeUploadDialog">取消</el-button>
        <el-button
          type="primary"
          :loading="uploadLoading"
          @click="submitUpload"
        >
          确定上传
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 文档管理容器 */
.document-management {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  position: relative;
}

.document-management::before {
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

.document-management > * {
  position: relative;
  z-index: 1;
}

/* 搜索表单 */
.search-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.search-form:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.search-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.search-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.search-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.search-form :deep(.el-select) {
  width: 100%;
}

.search-form :deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}

.search-form :deep(.el-date-picker) {
  width: 100%;
}

.search-form :deep(.el-date-picker .el-input__wrapper) {
  border-radius: 12px;
}

.search-form :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-form :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.search-form :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.search-form :deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e0e6ed;
  color: #6c757d;
}

.search-form :deep(.el-button--default:hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 文档表格 */
.document-table {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.document-table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.document-table:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* 表格头部 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.table-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-header h3::before {
  content: '📄';
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

.table-header :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.table-header :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.table-header :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

/* 表格样式 */
.document-table :deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.document-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.document-table :deep(.el-table__header th) {
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  padding: 16px 12px;
}

.document-table :deep(.el-table__body tr) {
  transition: all 0.3s ease;
}

.document-table :deep(.el-table__body tr:hover) {
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.01);
}

.document-table :deep(.el-table__body td) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px 12px;
  font-weight: 500;
}

.document-table :deep(.el-tag) {
  border-radius: 20px;
  font-weight: 600;
  padding: 4px 12px;
  border: none;
}

.document-table :deep(.el-tag--success) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.document-table :deep(.el-tag--warning) {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: white;
}

.document-table :deep(.el-tag--info) {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
}

.document-table :deep(.el-tag--danger) {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: white;
}

/* 文件大小样式 */
.file-size {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  background: rgba(108, 117, 125, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* 文档操作按钮 */
.document-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.document-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 6px 12px;
  font-size: 12px;
}

.document-actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
}

.document-actions :deep(.el-button--success) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
}

.document-actions :deep(.el-button--danger) {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border: none;
}

.document-actions :deep(.el-button:hover) {
  transform: translateY(-1px);
}

/* 分页样式 */
.document-table :deep(.el-pagination) {
  margin-top: 24px;
  justify-content: center;
}

.document-table :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

.document-table :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.document-table :deep(.el-pagination .btn-prev),
.document-table :deep(.el-pagination .btn-next) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* 上传表单对话框 */
.upload-form {
  max-width: 500px;
}

.upload-form :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.upload-form :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.upload-form :deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 18px;
}

.upload-form :deep(.el-dialog__body) {
  padding: 24px;
}

.upload-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.upload-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.upload-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
}

.upload-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.upload-form :deep(.el-select) {
  width: 100%;
}

.upload-form :deep(.el-select .el-input__wrapper) {
  border-radius: 12px;
}

.upload-form :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.upload-form :deep(.el-textarea__inner:hover) {
  border-color: rgba(102, 126, 234, 0.3);
}

.upload-form :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.upload-form :deep(.el-upload) {
  width: 100%;
}

.upload-form :deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  background: rgba(102, 126, 234, 0.05);
  transition: all 0.3s ease;
}

.upload-form :deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-form :deep(.el-upload-dragger .el-icon) {
  color: #667eea;
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-form :deep(.el-upload-dragger .el-upload__text) {
  color: #6c757d;
  font-weight: 500;
}

/* 表单底部 */
.form-footer {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.form-footer :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  margin-left: 12px;
  transition: all 0.3s ease;
}

.form-footer :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.form-footer :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.form-footer :deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e0e6ed;
  color: #6c757d;
}

.form-footer :deep(.el-button--default:hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-management {
    padding: 16px;
  }
  
  .search-form,
  .document-table {
    padding: 20px;
    border-radius: 16px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .table-header h3 {
    font-size: 20px;
    text-align: center;
  }
  
  .document-table :deep(.el-table__header th) {
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .document-table :deep(.el-table__body td) {
    padding: 12px 8px;
    font-size: 14px;
  }
  
  .document-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .document-actions :deep(.el-button) {
    width: 100%;
    margin: 0;
  }
  
  .file-size {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .document-management {
    padding: 12px;
  }
  
  .search-form,
  .document-table {
    padding: 16px;
  }
  
  .table-header h3 {
    font-size: 18px;
  }
  
  .table-header h3::before {
    font-size: 24px;
  }
  
  .upload-form :deep(.el-dialog) {
    width: 95vw;
    margin: 0;
  }
  
  .form-footer {
    text-align: center;
  }
  
  .form-footer :deep(.el-button) {
    width: 100%;
    margin: 8px 0 0 0;
  }
  
  .upload-form :deep(.el-upload-dragger .el-icon) {
    font-size: 36px;
  }
}
</style>