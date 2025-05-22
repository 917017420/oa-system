<script setup>
import { RouterView } from 'vue-router';
import { useUserStore } from './stores/user';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  // 尝试从本地存储恢复用户会话
  userStore.initUserFromStorage();
});
</script>

<template>
  <RouterView />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>