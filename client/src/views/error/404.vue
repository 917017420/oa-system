<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-animation">
        <div class="error-number">4</div>
        <div class="error-icon">🔍</div>
        <div class="error-number">4</div>
      </div>
      
      <div class="error-text">
        <h1>页面走丢了</h1>
        <p>抱歉，您访问的页面可能已被删除、重命名或暂时不可用</p>
      </div>
      
      <div class="error-actions">
        <el-button type="primary" size="large" @click="$router.push('/')">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="$router.go(-1)">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
      
      <div class="error-suggestions">
        <h3>您可以尝试：</h3>
        <ul>
          <li>检查网址是否输入正确</li>
          <li>返回上一页面</li>
          <li>访问我们的首页</li>
          <li>联系系统管理员</li>
        </ul>
      </div>
    </div>
    
    <!-- 装饰性背景元素 -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>
  </div>
</template>

<script setup>
import { House, Back } from '@element-plus/icons-vue';

// 404 错误页面
</script>

<style scoped>
/* 错误页面容器 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.error-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

/* 错误内容 */
.error-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 2;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 错误动画 */
.error-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  animation: bounce 2s infinite;
}

.error-icon {
  font-size: 80px;
  animation: rotate 3s linear infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误文本 */
.error-text {
  margin-bottom: 40px;
}

.error-text h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-text p {
  font-size: 18px;
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

/* 错误操作按钮 */
.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.error-actions :deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 14px 28px;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.error-actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.error-actions :deep(.el-button--primary::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.error-actions :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.error-actions :deep(.el-button--primary:hover::before) {
  left: 100%;
}

.error-actions :deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e0e6ed;
  color: #6c757d;
}

.error-actions :deep(.el-button--default:hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
}

/* 错误建议 */
.error-suggestions {
  text-align: left;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.error-suggestions h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-suggestions h3::before {
  content: '💡';
  font-size: 20px;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.error-suggestions li {
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
}

.error-suggestions li::before {
  content: '•';
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 0;
  font-size: 16px;
}

.error-suggestions li:last-child {
  margin-bottom: 0;
}

/* 浮动装饰形状 */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 15%;
  animation-delay: 2s;
}

.shape-4 {
  width: 40px;
  height: 40px;
  bottom: 30%;
  right: 20%;
  animation-delay: 3s;
}

.shape-5 {
  width: 70px;
  height: 70px;
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    padding: 16px;
  }
  
  .error-content {
    padding: 32px 24px;
    border-radius: 20px;
  }
  
  .error-animation {
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .error-number {
    font-size: 80px;
  }
  
  .error-icon {
    font-size: 60px;
  }
  
  .error-text h1 {
    font-size: 24px;
  }
  
  .error-text p {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }
  
  .error-actions :deep(.el-button) {
    width: 100%;
    max-width: 200px;
  }
  
  .error-suggestions {
    padding: 20px;
  }
  
  .error-suggestions h3 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .error-content {
    padding: 24px 20px;
  }
  
  .error-number {
    font-size: 60px;
  }
  
  .error-icon {
    font-size: 40px;
  }
  
  .error-text h1 {
    font-size: 20px;
  }
  
  .error-text p {
    font-size: 14px;
  }
  
  .error-actions :deep(.el-button) {
    padding: 12px 24px;
    font-size: 14px;
  }
  
  .error-suggestions {
    padding: 16px;
  }
  
  .error-suggestions h3 {
    font-size: 14px;
  }
  
  .error-suggestions li {
    font-size: 13px;
  }
}
</style>