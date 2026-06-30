<template>
  <div>
    <el-card><template #header><span>评分报告管理</span></template>
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column label="用户" width="120"><template #default="{ row }">{{ row.user?.nickname || '-' }}</template></el-table-column>
        <el-table-column label="面试ID" width="80" prop="interview_id" />
        <el-table-column label="总分" width="80"><template #default="{ row }"><el-tag :type="row.total_score>=80?'success':row.total_score>=60?'warning':'danger'">{{ row.total_score }}</el-tag></template></el-table-column>
        <el-table-column label="专业(40%)" width="90" prop="professional_score" />
        <el-table-column label="表达(20%)" width="90" prop="expression_score" />
        <el-table-column label="逻辑(20%)" width="90" prop="logic_score" />
        <el-table-column label="理解(20%)" width="90" prop="understanding_score" />
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column label="操作" width="80"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="detailVisible" title="报告详情" width="700px">
      <template v-if="detail">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-statistic title="总得分" :value="detail.total_score" />
            <el-statistic title="专业得分" :value="detail.professional_score" />
            <el-statistic title="表达得分" :value="detail.expression_score" />
          </el-col>
          <el-col :span="12">
            <el-statistic title="逻辑得分" :value="detail.logic_score" />
            <el-statistic title="理解得分" :value="detail.understanding_score" />
            <el-statistic title="排名" :value="detail.position_rank || '-'" />
          </el-col>
        </el-row>
        <h4 style="margin-top:16px">优点</h4><p style="white-space:pre-wrap">{{ parseList(detail.strengths) }}</p>
        <h4>不足</h4><p style="white-space:pre-wrap">{{ parseList(detail.weaknesses) }}</p>
        <h4>建议</h4><p style="white-space:pre-wrap">{{ parseList(detail.suggestions) }}</p>
        <h4>详细反馈</h4><p>{{ detail.detailed_feedback || '-' }}</p>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as api from '@/api'
const list = ref([]); const loading = ref(false)
const detailVisible = ref(false); const detail = ref(null)

onMounted(async () => {
  loading.value = true
  try { const res = await api.getInterviews({ pageSize: 50, status: 'completed' }); list.value = (res.data.list || []).filter(i => i.scoreReport).map(i => ({ ...i.scoreReport, user: i.user })) } catch (e) { /* */ } finally { loading.value = false }
})

async function showDetail(row) {
  try { const res = await api.getInterviewDetail(row.interview_id); detail.value = res.data.interview?.scoreReport; detailVisible.value = true } catch (e) { /* */ }
}

function parseList(str) {
  try { return JSON.parse(str).join('\n') } catch { return str || '-' }
}
</script>
