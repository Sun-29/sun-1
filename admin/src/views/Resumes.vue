<template>
  <div>
    <el-card><template #header><span>简历管理</span></template>
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column label="用户" width="140"><template #default="{ row }">{{ row.user?.nickname || '-' }}</template></el-table-column>
        <el-table-column prop="file_name" label="文件名" min-width="180" />
        <el-table-column prop="match_position" label="匹配岗位" width="120" />
        <el-table-column label="综合评分" width="100"><template #default="{ row }"><el-tag :type="row.overall_score>=80?'success':row.overall_score>=60?'warning':'danger'">{{ row.overall_score || '-' }}</el-tag></template></el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total,prev,pager,next" @change="loadData" />
      </div>
    </el-card>
    <el-dialog v-model="detailVisible" title="简历分析详情" width="700px">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="综合评分">{{ detail.overall_score }}</el-descriptions-item>
          <el-descriptions-item label="内容分">{{ detail.content_score }}</el-descriptions-item>
          <el-descriptions-item label="格式分">{{ detail.format_score }}</el-descriptions-item>
          <el-descriptions-item label="匹配度">{{ detail.match_score }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-top:16px">优点</h4><p style="white-space:pre-wrap">{{ detail.strengths || '-' }}</p>
        <h4>不足</h4><p style="white-space:pre-wrap">{{ detail.weaknesses || '-' }}</p>
        <h4>优化建议</h4><p style="white-space:pre-wrap">{{ detail.suggestions || '-' }}</p>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'
const list = ref([]); const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const detailVisible = ref(false); const detail = ref(null)
onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const res = await api.getResumes({ page: pagination.page, pageSize: pagination.pageSize }); list.value = res.data.list; pagination.total = res.data.pagination.total } catch (e) { /* */ } finally { loading.value = false }
}
async function showDetail(row) { try { const res = await api.getResumeDetail(row.id); detail.value = res.data.analysis; detailVisible.value = true } catch (e) { /* */ } }
async function handleDelete(id) { try { await api.deleteResume(id); ElMessage.success('删除成功'); loadData() } catch (e) { /* */ } }
</script>
