<template>
  <el-header class="app-header">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span class="logo-text">游戏OA系统</span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeIndex"
        class="header-menu"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/appointments">预约列表</el-menu-item>
        <el-menu-item v-if="userStore.isLoggedIn" index="/my-appointments">
          我的预约
        </el-menu-item>
      </el-menu>

      <!-- 用户操作区域 -->
      <div class="user-section">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userName }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <el-button @click="$router.push('/login')" type="primary" plain>
              登录
            </el-button>
            <el-button @click="$router.push('/register')" type="primary">
              注册
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Monitor,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前激活的菜单项
const activeIndex = computed(() => {
  return route.path
})

// 处理菜单选择
const handleSelect = (key) => {
  router.push(key)
}

// 处理用户下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        userStore.logout()
        router.push('/')
      } catch {
        // 用户取消操作
      }
      break
  }
}
</script>

<style scoped>
.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo-section {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #409eff;
  font-size: 20px;
  font-weight: 600;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  color: #303133;
}

.header-menu {
  flex: 1;
  margin: 0 40px;
  border-bottom: none;
}

.header-menu .el-menu-item {
  border-bottom: none;
}

.user-section {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info .el-icon {
  margin-right: 4px;
}

.user-info .el-icon--right {
  margin-left: 4px;
  margin-right: 0;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .header-menu {
    margin: 0 20px;
  }
  
  .logo-text {
    display: none;
  }
}
</style>