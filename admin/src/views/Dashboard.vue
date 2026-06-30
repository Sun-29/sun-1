<template>
  <div>
    <!-- Stats Cards -->
    <div class="stat-cards">
      <div class="stat-card">
        <el-icon class="stat-icon" color="#409EFF"><User /></el-icon>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">注册用户</div>
        </div>
      </div>
      <div class="stat-card">
        <el-icon class="stat-icon" color="#67C23A"><View /></el-icon>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activeToday || 0 }}</div>
          <div class="stat-label">今日活跃</div>
        </div>
      </div>
      <div class="stat-card">
        <el-icon class="stat-icon" color="#E6A23C"><VideoCamera /></el-icon>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalInterviews || 0 }}</div>
          <div class="stat-label">面试总数</div>
        </div>
      </div>
      <div class="stat-card">
        <el-icon class="stat-icon" color="#F56C6C"><TrendCharts /></el-icon>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgScore || '0.0' }}</div>
          <div class="stat-label">平均得分</div>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="chart-row">
      <el-card>
        <template #header>用户注册趋势（近30天）</template>
        <v-chart :option="userTrendOption" style="height:300px" autoresize />
      </el-card>
      <el-card>
        <template #header>面试趋势（近30天）</template>
        <v-chart :option="interviewTrendOption" style="height:300px" autoresize />
      </el-card>
    </div>

    <!-- Charts Row 2 -->
    <div class="chart-row">
      <el-card>
        <template #header>岗位热度排行</template>
        <v-chart :option="positionOption" style="height:300px" autoresize />
      </el-card>
      <el-card>
        <template #header>分数分布</template>
        <v-chart :option="scoreOption" style="height:300px" autoresize />
      </el-card>
    </div>

    <!-- Recent Activities -->
    <el-card style="margin-top:20px">
      <template #header>最近操作记录</template>
      <el-table :data="activities" stripe size="small" style="width:100%">
        <el-table-column prop="action" label="操作" width="100" />
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user?.nickname || row.admin?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import * as api from '@/api'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const stats = ref({})
const activities = ref([])
const userTrendData = ref([])
const interviewTrendData = ref([])
const positionData = ref([])
const scoreData = ref([])

const userTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: userTrendData.value.map(d => d.date) },
  yAxis: { type: 'value' },
  series: [{ data: userTrendData.value.map(d => d.count), type: 'line', smooth: true, areaStyle: { opacity: 0.3 } }]
}))

const interviewTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: interviewTrendData.value.map(d => d.date) },
  yAxis: { type: 'value' },
  series: [{ data: interviewTrendData.value.map(d => d.count), type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, color: '#67C23A' }]
}))

const positionOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', radius: ['40%', '70%'], data: positionData.value.map(d => ({ name: d.position?.name || 'Unknown', value: d.count })) }]
}))

const scoreOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: scoreData.value.map(d => d.label) },
  yAxis: { type: 'value' },
  series: [{ data: scoreData.value.map(d => d.count), type: 'bar', itemStyle: { borderRadius: [4,4,0,0] } }]
}))

onMounted(async () => {
  try {
    const [s, uTrend, iTrend, pData, sData, acts] = await Promise.all([
      api.getDashboardStats(), api.getUserTrend(), api.getInterviewTrend(),
      api.getPositionPopularity(), api.getScoreDistribution(), api.getRecentActivities()
    ])
    stats.value = s.data
    userTrendData.value = uTrend.data.trend || []
    interviewTrendData.value = iTrend.data.trend || []
    positionData.value = pData.data.data || []
    scoreData.value = sData.data.distribution || []
    activities.value = acts.data.activities || []
  } catch (e) { console.error('Dashboard load error:', e) }
})
</script>
