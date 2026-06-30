<template>
  <div>
    <el-card style="margin-bottom:20px"><template #header><span>发送系统通知</span></template>
      <el-form :model="msgForm" label-width="80px">
        <el-form-item label="标题"><el-input v-model="msgForm.title" placeholder="通知标题" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="msgForm.content" type="textarea" :rows="3" placeholder="通知内容" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleBroadcast">发送给全部用户</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card><template #header><span>已发送消息</span></template>
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column label="类型" width="100"><template #default="{ row }"><el-tag size="small">{{ typeMap[row.type] }}</el-tag></template></el-table-column>
        <el-table-column label="目标" width="100"><template #default="{ row }">{{ row.user?.nickname || '全部用户' }}</template></el-table-column>
        <el-table-column prop="created_at" label="时间" width="170" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'

const list = ref([]); const loading = ref(false)
const msgForm = reactive({ title: '', content: '' })
const typeMap = { system: '系统', interview: '面试', resume: '简历', task: '任务' }

onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const res = await api.getAdminMessages({ pageSize: 50 }); list.value = res.data.list } catch (e) { /* */ } finally { loading.value = false }
}
async function handleBroadcast() {
  if (!msgForm.title || !msgForm.content) { ElMessage.warning('请填写标题和内容'); return }
  try { await api.broadcastMessage(msgForm); ElMessage.success('发送成功'); msgForm.title = ''; msgForm.content = ''; loadData() } catch (e) { /* */ }
}
</script>
