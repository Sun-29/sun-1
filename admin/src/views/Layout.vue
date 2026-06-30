<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <span v-show="!appStore.sidebarCollapsed">AI面试管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        background-color="transparent"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#fff"
        router
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Main Container -->
    <div class="main-container">
      <!-- Header -->
      <div class="header-bar">
        <div style="display:flex;align-items:center;gap:12px">
          <el-button :icon="Fold" text @click="appStore.toggleSidebar()" />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <el-switch v-model="appStore.darkMode" @change="appStore.toggleDarkMode()" :active-icon="Moon" :inactive-icon="Sunny" inline-prompt />
          <el-dropdown trigger="click">
            <span style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <el-avatar :size="32" :icon="UserFilled" />
              <span>{{ authStore.admin?.username || 'Admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Content -->
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { Fold, Moon, Sunny, UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '')

const menuItems = [
  { path: '/dashboard', title: '数据看板', icon: 'House' },
  { path: '/users', title: '用户管理', icon: 'User' },
  { path: '/positions', title: '岗位管理', icon: 'Briefcase' },
  { path: '/questions', title: '题库管理', icon: 'QuestionFilled' },
  { path: '/interviews', title: '面试记录', icon: 'VideoCamera' },
  { path: '/resumes', title: '简历管理', icon: 'Document' },
  { path: '/reports', title: '评分报告', icon: 'DataAnalysis' },
  { path: '/messages', title: '消息管理', icon: 'Bell' },
  { path: '/settings', title: '系统设置', icon: 'Setting' }
]

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
  authStore.logout()
  window.location.href = '/login'
}
</script>
