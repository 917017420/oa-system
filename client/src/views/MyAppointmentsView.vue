<template>
  <div class="my-appointments-view">
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">我的预约</h1>
        <el-button 
          type="primary" 
          @click="$router.push('/')"
        >
          <el-icon><Plus /></el-icon>
          创建预约
        </el-button>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我创建的" name="created">
          <div class="appointments-section">
            <!-- 加载状态 -->
            <div v-if="createdLoading" class="loading-container">
              <div class="skeleton-grid">
                <el-skeleton 
                  v-for="i in 6" 
                  :key="i" 
                  :rows="4" 
                  animated 
                  class="skeleton-card"
                />
              </div>
            </div>
            
            <!-- 预约列表 -->
            <div v-else-if="createdAppointments.length" class="appointments-grid">
              <AppointmentCard 
                v-for="appointment in createdAppointments" 
                :key="appointment._id"
                :appointment="appointment"
                @click="$router.push(`/appointments/${appointment._id}`)"
              />
            </div>
            
            <!-- 空状态 -->
            <div v-else class="empty-state">
              <el-empty description="您还没有创建任何预约">
                <el-button 
                  type="primary" 
                  @click="$router.push('/')"
                >
                  创建第一个预约
                </el-button>
              </el-empty>
            </div>
            
            <!-- 分页 -->
            <div v-if="createdAppointments.length && createdTotal > createdPageSize" class="pagination-container">
              <el-pagination
                :current-page="createdCurrentPage"
                :page-size="createdPageSize"
                :page-sizes="[6, 12, 24, 48]"
                :total="createdTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleCreatedPageSizeChange"
                @current-change="handleCreatedPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我参与的" name="joined">
          <div class="appointments-section">
            <!-- 加载状态 -->
            <div v-if="joinedLoading" class="loading-container">
              <div class="skeleton-grid">
                <el-skeleton 
                  v-for="i in 6" 
                  :key="i" 
                  :rows="4" 
                  animated 
                  class="skeleton-card"
                />
              </div>
            </div>
            
            <!-- 预约列表 -->
            <div v-else-if="joinedAppointments.length" class="appointments-grid">
              <AppointmentCard 
                v-for="appointment in joinedAppointments" 
                :key="appointment._id"
                :appointment="appointment"
                @click="$router.push(`/appointments/${appointment._id}`)"
              />
            </div>
            
            <!-- 空状态 -->
            <div v-else class="empty-state">
              <el-empty description="您还没有参与任何预约">
                <el-button 
                  type="primary" 
                  @click="$router.push('/appointments')"
                >
                  浏览预约
                </el-button>
              </el-empty>
            </div>
            
            <!-- 分页 -->
            <div v-if="joinedAppointments.length && joinedTotal > joinedPageSize" class="pagination-container">
              <el-pagination
                :current-page="joinedCurrentPage"
                :page-size="joinedPageSize"
                :page-sizes="[6, 12, 24, 48]"
                :total="joinedTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleJoinedPageSizeChange"
                @current-change="handleJoinedPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppointmentsStore } from '@/stores/appointments'
import AppointmentCard from '@/components/AppointmentCard.vue'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const appointmentsStore = useAppointmentsStore()

// 标签页状态
const activeTab = ref('created')

// 我创建的预约状态
const createdLoading = ref(false)
const createdCurrentPage = ref(1)
const createdPageSize = ref(12)
const createdAppointments = ref([])
const createdTotal = ref(0)

// 我参与的预约状态
const joinedLoading = ref(false)
const joinedCurrentPage = ref(1)
const joinedPageSize = ref(12)
const joinedAppointments = ref([])
const joinedTotal = ref(0)

// 获取我创建的预约
const fetchCreatedAppointments = async () => {
  if (!userStore.isLoggedIn) return
  
  createdLoading.value = true
  try {
    const params = {
      page: createdCurrentPage.value,
      limit: createdPageSize.value,
      creator: userStore.user._id
    }
    
    const result = await appointmentsStore.fetchAppointments(params)
    if (result.success) {
      createdAppointments.value = result.data.appointments
      createdTotal.value = result.data.total
    }
  } catch (error) {
    console.error('获取我创建的预约失败:', error)
  } finally {
    createdLoading.value = false
  }
}

// 获取我参与的预约
const fetchJoinedAppointments = async () => {
  if (!userStore.isLoggedIn) return
  
  joinedLoading.value = true
  try {
    const params = {
      page: joinedCurrentPage.value,
      limit: joinedPageSize.value,
      participant: userStore.user._id
    }
    
    const result = await appointmentsStore.fetchAppointments(params)
    if (result.success) {
      joinedAppointments.value = result.data.appointments
      joinedTotal.value = result.data.total
    }
  } catch (error) {
    console.error('获取我参与的预约失败:', error)
  } finally {
    joinedLoading.value = false
  }
}

// 标签页切换
const handleTabChange = (tabName) => {
  if (tabName === 'created') {
    fetchCreatedAppointments()
  } else if (tabName === 'joined') {
    fetchJoinedAppointments()
  }
}

// 我创建的预约分页处理
const handleCreatedPageChange = (page) => {
  createdCurrentPage.value = page
  fetchCreatedAppointments()
}

const handleCreatedPageSizeChange = (size) => {
  createdPageSize.value = size
  createdCurrentPage.value = 1
  fetchCreatedAppointments()
}

// 我参与的预约分页处理
const handleJoinedPageChange = (page) => {
  joinedCurrentPage.value = page
  fetchJoinedAppointments()
}

const handleJoinedPageSizeChange = (size) => {
  joinedPageSize.value = size
  joinedCurrentPage.value = 1
  fetchJoinedAppointments()
}

// 监听用户登录状态
watch(
  () => userStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      if (activeTab.value === 'created') {
        fetchCreatedAppointments()
      } else {
        fetchJoinedAppointments()
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchCreatedAppointments()
  }
})
</script>

<style scoped>
.my-appointments-view {
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.appointments-section {
  margin-top: 24px;
}

.loading-container {
  padding: 20px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px 0;
}

/* Element Plus 标签页样式覆盖 */
:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: #f0f0f0;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  background-color: #409eff;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .appointments-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 16px;
  }
  
  :deep(.el-pagination) {
    justify-content: center;
  }
  
  :deep(.el-pagination .el-pagination__sizes),
  :deep(.el-pagination .el-pagination__jump) {
    display: none;
  }
}

@media (max-width: 480px) {
  .appointments-grid {
    gap: 12px;
  }
  
  .skeleton-grid {
    gap: 12px;
  }
  
  .empty-state {
    padding: 40px 10px;
  }
}
</style>