<template>
  <div>
    <el-card style="margin-bottom:20px"><template #header><span>系统配置</span></template>
      <el-form :model="config" label-width="140px">
        <el-form-item label="站点名称"><el-input v-model="config.siteName" /></el-form-item>
        <el-form-item label="最大面试时长(分钟)"><el-input-number v-model="config.maxInterviewDuration" :min="10" :max="120" /></el-form-item>
        <el-form-item label="每日最大面试次数"><el-input-number v-model="config.maxDailyInterviews" :min="1" :max="50" /></el-form-item>
        <el-form-item label="AI模型"><el-input v-model="config.aiModel" disabled /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSaveConfig">保存配置</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card><template #header><span>系统日志</span></template>
      <el-form :inline="true" :model="logFilters" style="margin-bottom:16px">
        <el-form-item><el-select v-model="logFilters.module" placeholder="模块" clearable @change="loadLogs"><el-option label="auth" value="auth"/><el-option label="interview" value="interview"/><el-option label="user" value="user"/></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="loadLogs">查询</el-button></el-form-item>
      </el-form>
      <el-table :data="logs" stripe v-loading="logLoading" style="width:100%" max-height="400">
        <el-table-column prop="action" label="操作" width="80" />
        <el-table-column prop="module" label="模块" width="80" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="用户" width="120"><template #default="{ row }">{{ row.user?.nickname || row.admin?.username || '-' }}</template></el-table-column>
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="created_at" label="时间" width="170" />
      </el-table>
      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="logPage.page" v-model:page-size="logPage.pageSize" :total="logPage.total" layout="total,prev,pager,next" @change="loadLogs" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'

const config = reactive({ siteName: 'AI面试模拟系统', maxInterviewDuration: 60, maxDailyInterviews: 10, aiModel: 'deepseek' })
const logs = ref([]); const logLoading = ref(false)
const logFilters = reactive({ module: '' })
const logPage = reactive({ page: 1, pageSize: 20, total: 0 })

onMounted(() => { loadConfigs(); loadLogs() })

async function loadConfigs() {
  try { const res = await api.getSystemConfig(); Object.assign(config, res.data) } catch (e) { /* */ }
}
async function handleSaveConfig() {
  try { await api.updateSystemConfig(config); ElMessage.success('配置保存成功') } catch (e) { /* */ }
}
async function loadLogs() {
  logLoading.value = true
  try { const res = await api.getSystemLogs({ page: logPage.page, pageSize: logPage.pageSize, ...logFilters }); logs.value = res.data.list; logPage.total = res.data.pagination.total } catch (e) { /* */ } finally { logLoading.value = false }
}
</script>
