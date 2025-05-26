<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import {
  Menu as IconMenu,
  Document,
  HomeFilled,
  User,
  UserFilled,
  Message
} from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

// 侧边栏折叠状态
const isCollapse = ref(false);
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

// 用户信息
const userInfo = computed(() => userStore.userInfo);

// 退出登录
const handleLogout = () => {
  userStore.logout();
};

// 获取路由菜单
const routes = computed(() => {
  return router.options.routes.find(route => route.path === '/').children.filter(route => {
    // 过滤需要认证的路由
    if (!route.meta?.requiresAuth) return false;
    
    // 过滤基于角色的路由
    if (route.meta?.roles) {
      return route.meta.roles.some(role => userStore.roles.includes(role));
    }
    
    return true;
  });
});
</script>

<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="sidebar-container">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="Logo" v-if="!isCollapse" />
        <img src="../assets/logo-mini.png" alt="Logo" v-else />
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item v-for="route in routes" :key="route.path" :index="'/' + route.path">
          <el-icon>
            <component :is="route.meta?.icon || 'Document'" />
          </el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主要内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-icon class="toggle-button" @click="toggleSidebar">
            <IconMenu />
          </el-icon>
          <breadcrumb />
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="32" :src="userInfo?.avatar || ''">
                {{ userInfo?.name?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userInfo?.name || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><IconMenu /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.logo-container img {
  height: 32px;
}

.el-menu-vertical {
  border-right: none;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-container {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-button {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>