<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>用户管理</span>
        </div>
      </template>
      <!-- Filters -->
      <el-form :inline="true" :model="filters" style="margin-bottom:16px">
        <el-form-item><el-input v-model="filters.keyword" placeholder="搜索用户/手机/邮箱" clearable @clear="loadData" @keyup.enter="loadData" /></el-form-item>
        <el-form-item><el-select v-model="filters.status" placeholder="状态" clearable @change="loadData" style="width:120px"><el-option label="正常" :value="1" /><el-option label="禁用" :value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">搜索</el-button></el-form-item>
      </el-form>
      <!-- Table -->
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column label="用户" min-width="180">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:10px">
              <el-avatar :size="36" :src="row.avatar_url" :icon="UserFilled" />
              <div><div style="font-weight:600">{{ row.nickname }}</div><div style="font-size:12px;color:#909399">{{ row.phone || row.email }}</div></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="school" label="学校" width="120" />
        <el-table-column prop="job_direction" label="求职方向" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">{{ row.status === 1 ? '禁用' : '启用' }}</el-button>
            <el-popconfirm title="确定删除该用户？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @change="loadData" />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="用户详情" width="600px">
      <el-descriptions v-if="detailUser" :column="2" border>
        <el-descriptions-item label="昵称">{{ detailUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailUser.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ detailUser.school || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ detailUser.major || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ detailUser.grade || '-' }}</el-descriptions-item>
        <el-descriptions-item label="求职方向">{{ detailUser.job_direction || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detailUser.created_at }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'

const list = ref([])
const loading = ref(false)
const filters = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const detailVisible = ref(false)
const detailUser = ref(null)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await api.getUsers({ page: pagination.page, pageSize: pagination.pageSize, ...filters })
    list.value = res.data.list
    pagination.total = res.data.pagination.total
  } catch (e) { /* handled */ } finally { loading.value = false }
}

async function showDetail(row) {
  try {
    const res = await api.getUserDetail(row.id)
    detailUser.value = res.data.user
    detailVisible.value = true
  } catch (e) { /* handled */ }
}

async function toggleStatus(row) {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await api.updateUserStatus(row.id, newStatus)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    loadData()
  } catch (e) { /* handled */ }
}

async function handleDelete(id) {
  try { await api.deleteUser(id); ElMessage.success('删除成功'); loadData() } catch (e) { /* handled */ }
}
</script>
