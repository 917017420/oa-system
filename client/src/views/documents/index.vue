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
    `确定要删除文档