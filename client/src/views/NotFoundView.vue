<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-content">
        <!-- 404 图标 -->
        <div class="error-icon">
          <div class="number-404">
            <span class="four">4</span>
            <span class="zero">0</span>
            <span class="four">4</span>
          </div>
          <div class="error-illustration">
            <svg viewBox="0 0 200 200" class="illustration-svg">
              <!-- 游戏手柄图标 -->
              <g class="gamepad">
                <rect x="50" y="80" width="100" height="60" rx="30" fill="#e0e6ed" stroke="#c0c4cc" stroke-width="2"/>
                <circle cx="75" cy="100" r="8" fill="#909399"/>
                <circle cx="125" cy="100" r="8" fill="#909399"/>
                <rect x="90" y="95" width="20" height="3" fill="#606266"/>
                <rect x="98.5" y="87" width="3" height="20" fill="#606266"/>
                <circle cx="160" cy="90" r="4" fill="#f56c6c"/>
                <circle cx="170" cy="100" r="4" fill="#67c23a"/>
                <circle cx="150" cy="100" r="4" fill="#409eff"/>
                <circle cx="160" cy="110" r="4" fill="#e6a23c"/>
              </g>
              <!-- 问号 -->
              <text x="100" y="160" text-anchor="middle" font-size="24" fill="#909399" font-weight="bold">?</text>
            </svg>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div class="error-info">
          <h1 class="error-title">页面未找到</h1>
          <p class="error-description">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <p class="error-suggestion">
            请检查网址是否正确，或返回首页继续浏览。
          </p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="error-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="goHome"
          >
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          
          <el-button 
            size="large"
            @click="goBack"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回上页
          </el-button>
          
          <el-button 
            size="large"
            @click="goAppointments"
          >
            <el-icon><Calendar /></el-icon>
            浏览预约
          </el-button>
        </div>
        
        <!-- 快捷链接 -->
        <div class="quick-links">
          <h3 class="links-title">您可能想要：</h3>
          <div class="links-grid">
            <router-link to="/" class="quick-link">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </router-link>
            
            <router-link to="/appointments" class="quick-link">
              <el-icon><Calendar /></el-icon>
              <span>预约列表</span>
            </router-link>
            
            <router-link 
              v-if="userStore.isLoggedIn" 
              to="/" 
              class="quick-link"
            >
              <el-icon><Plus /></el-icon>
              <span>创建预约</span>
            </router-link>
            
            <router-link 
              v-if="userStore.isLoggedIn" 
              to="/my-appointments" 
              class="quick-link"
            >
              <el-icon><User /></el-icon>
              <span>我的预约</span>
            </router-link>
            
            <router-link 
              v-if="!userStore.isLoggedIn" 
              to="/login" 
              class="quick-link"
            >
              <el-icon><User /></el-icon>
              <span>登录</span>
            </router-link>
            
            <router-link 
              v-if="!userStore.isLoggedIn" 
              to="/register" 
              class="quick-link"
            >
              <el-icon><UserFilled /></el-icon>
              <span>注册</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  House,
  ArrowLeft,
  Calendar,
  Plus,
  User,
  UserFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 前往预约页面
const goAppointments = () => {
  router.push('/appointments')
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-container {
  max-width: 600px;
  width: 100%;
}

.not-found-content {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.error-icon {
  margin-bottom: 40px;
}

.number-404 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.number-404 span {
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: bounce 2s infinite;
}

.number-404 .four:first-child {
  animation-delay: 0s;
}

.number-404 .zero {
  animation-delay: 0.2s;
}

.number-404 .four:last-child {
  animation-delay: 0.4s;
}

.error-illustration {
  display: flex;
  justify-content: center;
}

.illustration-svg {
  width: 120px;
  height: 120px;
  opacity: 0.8;
}

.gamepad {
  animation: float 3s ease-in-out infinite;
}

.error-info {
  margin-bottom: 40px;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.error-description {
  font-size: 18px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.6;
}

.error-suggestion {
  font-size: 16px;
  color: #909399;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.quick-links {
  border-top: 1px solid #f0f0f0;
  padding-top: 30px;
}

.links-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  text-decoration: none;
  color: #606266;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.quick-link:hover {
  background: #e9ecef;
  color: #409eff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.quick-link .el-icon {
  font-size: 24px;
}

.quick-link span {
  font-size: 14px;
  font-weight: 500;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;
  }
  
  .number-404 span {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .error-suggestion {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .quick-link {
    padding: 16px 12px;
  }
  
  .quick-link .el-icon {
    font-size: 20px;
  }
  
  .quick-link span {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .not-found-view {
    padding: 10px;
  }
  
  .not-found-content {
    padding: 30px 15px;
  }
  
  .number-404 span {
    font-size: 48px;
  }
  
  .illustration-svg {
    width: 80px;
    height: 80px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>