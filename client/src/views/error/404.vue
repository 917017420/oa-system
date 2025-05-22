<template>
  <div class="error-container">
    <div class="error-content">
      <el-result
        icon="error"
        title="404"
        sub-title="抱歉，您访问的页面不存在"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
// 404 错误页面
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 500px;
}

.error-content {
  text-align: center;
}
</style>