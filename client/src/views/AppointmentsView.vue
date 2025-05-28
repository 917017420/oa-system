<template>
  <div class="appointments-view">
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">游戏预约</h1>
        <div class="header-actions">
          <el-button 
            v-if="userStore.isLoggedIn" 
            type="primary" 
            @click="$router.push('/')"
          >
            <el-icon><Plus /></el-icon>
            发起预约
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8">
            <el-input
              v-model="searchForm.game"
              placeholder="搜索游戏名称"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-select
              v-model="searchForm.status"
              placeholder="预约状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="即将开始" value="upcoming" />
              <el-option label="已结束" value="past" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8">
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 预约列表 -->
      <div class="appointments-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="appointments.length === 0" class="empty-container">
          <el-empty description="暂无预约">
            <el-button 
              v-if="userStore.isLoggedIn" 
              type="primary" 
              @click="$router.push('/')"
            >
              发起第一个预约
            </el-button>
          </el-empty>
        </div>
        
        <div v-else>
          <el-row :gutter="16">
            <el-col 
              :xs="24" 
              :sm="12" 
              :lg="8" 
              v-for="appointment in appointments" 
              :key="appointment._id"
            >
              <AppointmentCard 
                :appointment="appointment" 
                @click="goToDetail(appointment._id)" 
              />
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.limit"
          :page-sizes="[6, 12, 24, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppointmentsStore } from '@/stores/appointments'
import AppointmentCard from '@/components/AppointmentCard.vue'
import {
  Plus,
  Search
} from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'

const router = useRouter()
const userStore = useUserStore()
const appointmentsStore = useAppointmentsStore()

const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  game: '',
  status: ''
})

// 计算属性
const appointments = computed(() => appointmentsStore.appointments)
const pagination = computed(() => appointmentsStore.pagination)

// 获取预约列表
const fetchAppointments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    if (searchForm.game) {
      params.game = searchForm.game
    }
    
    if (searchForm.status === 'upcoming') {
      params.upcoming = true
    } else if (searchForm.status === 'past') {
      params.upcoming = false
    }
    
    await appointmentsStore.fetchAppointments(params)
  } catch (error) {
    console.error('获取预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 防抖搜索
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  fetchAppointments()
}, 500)

// 处理搜索
const handleSearch = () => {
  debouncedSearch()
}

// 重置搜索
const resetSearch = () => {
  searchForm.game = ''
  searchForm.status = ''
  pagination.value.page = 1
  fetchAppointments()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  pagination.value.page = page
  fetchAppointments()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchAppointments()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/appointments/${id}`)
}

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.appointments-view {
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header .page-title {
  margin-bottom: 0;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-section .el-col {
  margin-bottom: 16px;
}

.appointments-list {
  margin-bottom: 24px;
}

.loading-container,
.empty-container {
  padding: 60px 20px;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-header .page-title {
    text-align: center;
  }
  
  .search-section .el-col:last-child {
    text-align: center;
  }
  
  .search-section .el-col:last-child .el-button {
    margin: 0 8px;
  }
}
</style>