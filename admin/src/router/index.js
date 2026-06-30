import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { noAuth: true }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '数据看板', icon: 'House' } },
      { path: 'users', name: 'Users', component: () => import('@/views/Users.vue'), meta: { title: '用户管理', icon: 'User' } },
      { path: 'positions', name: 'Positions', component: () => import('@/views/Positions.vue'), meta: { title: '岗位管理', icon: 'Briefcase' } },
      { path: 'questions', name: 'Questions', component: () => import('@/views/Questions.vue'), meta: { title: '题库管理', icon: 'QuestionFilled' } },
      { path: 'interviews', name: 'Interviews', component: () => import('@/views/Interviews.vue'), meta: { title: '面试记录', icon: 'VideoCamera' } },
      { path: 'resumes', name: 'Resumes', component: () => import('@/views/Resumes.vue'), meta: { title: '简历管理', icon: 'Document' } },
      { path: 'reports', name: 'Reports', component: () => import('@/views/Reports.vue'), meta: { title: '评分报告', icon: 'DataAnalysis' } },
      { path: 'messages', name: 'Messages', component: () => import('@/views/Messages.vue'), meta: { title: '消息管理', icon: 'Bell' } },
      { path: 'settings', name: 'Settings', component: () => import('@/views/Settings.vue'), meta: { title: '系统设置', icon: 'Setting' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.noAuth) {
    if (authStore.isAuthenticated && to.path === '/login') {
      return next('/dashboard')
    }
    return next()
  }
  if (!authStore.isAuthenticated) {
    return next('/login')
  }
  next()
})

export default router
