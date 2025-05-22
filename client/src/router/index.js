import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

// 路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录', requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('../layout/index.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/index.vue'),
          meta: { title: '工作台', icon: 'dashboard', requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/profile/index.vue'),
          meta: { title: '个人中心', icon: 'user', requiresAuth: true }
        },
        {
          path: 'documents',
          name: 'Documents',
          component: () => import('../views/documents/index.vue'),
          meta: { title: '文档管理', icon: 'document', requiresAuth: true }
        },
        {
          path: 'workflows',
          name: 'Workflows',
          component: () => import('../views/workflows/index.vue'),
          meta: { title: '工作流程', icon: 'connection', requiresAuth: true }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../views/users/index.vue'),
          meta: { title: '用户管理', icon: 'user-group', requiresAuth: true, roles: ['admin'] }
        },
        {
          path: 'game-invitations/create',
          name: 'CreateGameInvitation',
          component: () => import('../views/game_invitations/CreateInvitation.vue'),
          meta: { title: '创建游戏邀请', icon: 'plus', requiresAuth: true }
        },
        {
          path: 'game-invitations/my',
          name: 'MyGameInvitations',
          component: () => import('../views/game_invitations/MyInvitations.vue'),
          meta: { title: '我发出的邀约', icon: 'message', requiresAuth: true }
        },
        {
          path: 'game-invitations/received',
          name: 'ReceivedGameInvitations',
          component: () => import('../views/game_invitations/ReceivedInvitations.vue'),
          meta: { title: '我收到的邀约', icon: 'bell', requiresAuth: true }
        },
        {
          path: 'game-invitations/admin',
          name: 'AdminGameInvitations',
          component: () => import('../views/game_invitations/AdminInvitations.vue'),
          meta: { title: '邀请管理', icon: 'management', requiresAuth: true, roles: ['admin'] }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/error/404.vue'),
      meta: { title: '404', requiresAuth: false }
    }
  ]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - OA办公自动化系统` : 'OA办公自动化系统';

  const userStore = useUserStore();

  // 尝试从localStorage初始化用户状态，并验证token
  if (!userStore.isLoggedIn && localStorage.getItem('token')) {
    userStore.initUserFromStorage(); // 这会设置token和axios header
    if (userStore.isLoggedIn) {
      try {
        await userStore.getUserInfo(); // 尝试获取最新用户信息
      } catch (error) {
        console.error('自动登录时获取用户信息失败:', error);
        userStore.logout(); // 如果获取失败，可能是token无效，登出
        if (to.meta.requiresAuth) {
          next({ name: 'login', query: { redirect: to.fullPath } });
          return;
        }
      }
    }
  }

  const isLoggedIn = userStore.isLoggedIn;

  // 需要认证但未登录，重定向到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.name === 'login' && isLoggedIn) {
    next({ name: 'Dashboard' });
    return;
  }

  // 角色权限检查
  if (to.meta.roles && isLoggedIn) {
    const hasRole = to.meta.roles.some(role => userStore.roles.includes(role));
    if (!hasRole) {
      // 如果用户没有所需角色，可以重定向到仪表盘或错误页
      // 为简单起见，这里重定向到仪表盘，但可以根据需要改为403页面
      console.warn(`用户 ${userStore.userInfo?.username} 尝试访问需要角色 ${to.meta.roles.join(', ')} 的页面 ${to.path}，但其角色为 ${userStore.roles.join(', ')}`);
      next({ name: 'Dashboard' }); // 或者 next({ name: 'ErrorForbidden' }) 如果有这样的路由
      return;
    }
  }

  next();
});

export default router