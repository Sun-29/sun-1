<template>
  <div>
    <el-card>
      <template #header><span>面试记录管理</span></template>
      <el-form :inline="true" :model="filters" style="margin-bottom:16px">
        <el-form-item><el-input v-model="filters.keyword" placeholder="搜索用户" clearable @change="loadData" style="width:180px"/></el-form-item>
        <el-form-item><el-select v-model="filters.status" placeholder="状态" clearable @change="loadData" style="width:120px"><el-option label="待开始" value="pending"/><el-option label="进行中" value="ongoing"/><el-option label="已完成" value="completed"/></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">搜索</el-button></el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading" style="width:100%" @row-click="showDetail">
        <el-table-column label="用户" width="140"><template #default="{ row }">{{ row.user?.nickname || '-' }}</template></el-table-column>
        <el-table-column label="岗位" width="140"><template #default="{ row }">{{ row.position?.name || '-' }}</template></el-table-column>
        <el-table-column label="难度" width="70"><template #default="{ row }"><el-tag :type="row.difficulty==='junior'?'success':row.difficulty==='mid'?'warning':'danger'" size="small">{{ row.difficulty==='junior'?'初级':row.difficulty==='mid'?'中级':'高级' }}</el-tag></template></el-table-column>
        <el-table-column label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status==='completed'?'success':row.status==='ongoing'?'warning':'info'" size="small">{{ statusMap[row.status] }}</el-tag></template></el-table-column>
        <el-table-column prop="total_score" label="得分" width="70" />
        <el-table-column prop="created_at" label="时间" width="170" />
      </el-table>
      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total,prev,pager,next" @change="loadData" />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="面试详情" width="800px" top="5vh">
      <template v-if="detail">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="用户">{{ detail.user?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ detail.position?.name }}</el-descriptions-item>
          <el-descriptions-item label="难度">{{ detail.difficulty }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusMap[detail.status] }}</el-descriptions-item>
          <el-descriptions-item label="总分">{{ detail.total_score || '-' }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ detail.created_at }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin:16px 0 8px">问答详情</h4>
        <div v-for="(d, i) in (detail.details || [])" :key="d.id" style="margin-bottom:16px;padding:12px;background:#f5f7fa;border-radius:8px">
          <p><strong>Q{{ i+1 }}:</strong> {{ d.question_content }}</p>
          <p v-if="d.user_answer"><strong>A:</strong> {{ d.user_answer }}</p>
          <p v-if="d.ai_score !== null"><strong>AI评分:</strong> {{ d.ai_score }} | {{ d.ai_comment }}</p>
          <div v-if="d.ai_follow_up" style="margin-top:8px;padding:8px;background:#fff;border-left:3px solid #409EFF">
            <p><strong>追问:</strong> {{ d.ai_follow_up }}</p>
            <p v-if="d.ai_follow_up_answer"><strong>回答:</strong> {{ d.ai_follow_up_answer }}</p>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as api from '@/api'
const list = ref([]); const loading = ref(false)
const filters = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const detailVisible = ref(false); const detail = ref(null)
const statusMap = { pending: '待开始', ongoing: '进行中', completed: '已完成', cancelled: '已取消' }

onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const res = await api.getInterviews({ page: pagination.page, pageSize: pagination.pageSize, ...filters }); list.value = res.data.list; pagination.total = res.data.pagination.total } catch (e) { /* */ } finally { loading.value = false }
}
async function showDetail(row) {
  try { const res = await api.getInterviewDetail(row.id); detail.value = res.data.interview; detailVisible.value = true } catch (e) { /* */ }
}
</script>
