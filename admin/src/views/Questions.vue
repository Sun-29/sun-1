<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>题库管理</span>
          <div style="display:flex;gap:8px">
            <el-button @click="activeTab='list'">题目列表</el-button>
            <el-button @click="activeTab='categories'">分类管理</el-button>
            <el-button type="primary" @click="openQuestionDialog()">新增题目</el-button>
            <el-button @click="showImport=true">批量导入</el-button>
          </div>
        </div>
      </template>

      <template v-if="activeTab==='list'">
        <!-- Filters -->
        <el-form :inline="true" :model="filters" style="margin-bottom:16px">
          <el-form-item><el-input v-model="filters.keyword" placeholder="搜索题目" clearable @keyup.enter="loadData" style="width:200px" /></el-form-item>
          <el-form-item><el-select v-model="filters.category_id" placeholder="分类" clearable @change="loadData" style="width:140px"><el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
          <el-form-item><el-select v-model="filters.type" placeholder="类型" clearable @change="loadData" style="width:120px"><el-option label="基础" value="basic" /><el-option label="场景" value="scenario" /><el-option label="项目" value="project" /><el-option label="开放" value="open" /><el-option label="行为" value="behavioral" /><el-option label="HR" value="hr" /></el-select></el-form-item>
          <el-form-item><el-select v-model="filters.difficulty" placeholder="难度" clearable @change="loadData" style="width:100px"><el-option label="初级" value="junior" /><el-option label="中级" value="mid" /><el-option label="高级" value="senior" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" @click="loadData">搜索</el-button></el-form-item>
        </el-form>
        <!-- Table -->
        <el-table :data="list" stripe v-loading="loading" style="width:100%">
          <el-table-column prop="title" label="题目" min-width="250" show-overflow-tooltip />
          <el-table-column label="分类" width="100"><template #default="{ row }"><el-tag size="small">{{ row.category?.name }}</el-tag></template></el-table-column>
          <el-table-column label="类型" width="80"><template #default="{ row }"><el-tag :type="typeColor[row.type]" size="small">{{ typeMap[row.type] }}</el-tag></template></el-table-column>
          <el-table-column label="难度" width="70"><template #default="{ row }"><el-tag :type="diffColor[row.difficulty]" size="small">{{ diffMap[row.difficulty] }}</el-tag></template></el-table-column>
          <el-table-column prop="score" label="分值" width="60" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openQuestionDialog(row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top:16px;display:flex;justify-content:flex-end">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total,prev,pager,next" @change="loadData" />
        </div>
      </template>

      <!-- Categories Tab -->
      <template v-if="activeTab==='categories'">
        <el-button type="primary" @click="openCategoryDialog()" style="margin-bottom:16px">新增分类</el-button>
        <el-table :data="categoryList" stripe style="width:100%">
          <el-table-column prop="name" label="名称" width="160" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="sort_order" label="排序" width="60" />
          <el-table-column label="操作" width="160"><template #default="{ row }"><el-button link @click="openCategoryDialog(row)">编辑</el-button><el-button link type="danger" @click="handleDeleteCategory(row.id)">删除</el-button></template></el-table-column>
        </el-table>
      </template>
    </el-card>

    <!-- Question Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑题目' : '新增题目'" width="700px">
      <el-form ref="formRef" :model="form" :rules="qRules" label-width="80px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="分类"><el-select v-model="form.category_id" style="width:100%"><el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="类型"><el-select v-model="form.type" style="width:100%"><el-option v-for="(v,k) in typeMap" :key="k" :label="v" :value="k" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="难度"><el-select v-model="form.difficulty" style="width:100%"><el-option v-for="(v,k) in diffMap" :key="k" :label="v" :value="k" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="参考答案"><el-input v-model="form.reference_answer" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tags" placeholder="逗号分隔" /></el-form-item>
        <el-form-item label="分值"><el-input-number v-model="form.score" :min="1" :max="50" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSaveQuestion">保存</el-button></template>
    </el-dialog>

    <!-- Category Dialog -->
    <el-dialog v-model="catDialogVisible" :title="catIsEdit ? '编辑分类' : '新增分类'" width="450px">
      <el-form ref="catFormRef" :model="catForm" :rules="catRules" label-width="80px">
        <el-form-item label="名称" prop="name"><el-input v-model="catForm.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="catForm.description" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="catForm.sort_order" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="catDialogVisible=false">取消</el-button><el-button type="primary" @click="handleSaveCategory">保存</el-button></template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog v-model="showImport" title="批量导入题目" width="500px">
      <p style="margin-bottom:12px">请粘贴JSON格式题目数据（数组格式）：</p>
      <el-input v-model="importJson" type="textarea" :rows="8" placeholder='[{"title":"题目标题","content":"题目内容","type":"basic","difficulty":"junior","category_id":1}]' />
      <template #footer><el-button @click="showImport=false">取消</el-button><el-button type="primary" @click="handleImport">导入</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'

const activeTab = ref('list')
const list = ref([]); const loading = ref(false)
const filters = reactive({ keyword: '', category_id: '', type: '', difficulty: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const categoryList = ref([])
const typeMap = { basic: '基础', scenario: '场景', project: '项目', open: '开放', behavioral: '行为', hr: 'HR' }
const typeColor = { basic: '', scenario: 'success', project: 'warning', open: 'info', behavioral: 'danger', hr: '' }
const diffMap = { junior: '初级', mid: '中级', senior: '高级' }
const diffColor = { junior: 'success', mid: 'warning', senior: 'danger' }

// Question dialog
const dialogVisible = ref(false); const isEdit = ref(false); const editId = ref(null)
const formRef = ref(null)
const form = reactive({ title: '', content: '', type: 'basic', difficulty: 'junior', category_id: null, reference_answer: '', tags: '', score: 10 })
const qRules = { title: [{ required: true, message: '请输入标题' }], content: [{ required: true, message: '请输入内容' }] }

// Category dialog
const catDialogVisible = ref(false); const catIsEdit = ref(false); const catEditId = ref(null)
const catFormRef = ref(null)
const catForm = reactive({ name: '', description: '', sort_order: 0 })
const catRules = { name: [{ required: true, message: '请输入名称' }] }

// Import
const showImport = ref(false); const importJson = ref('')

onMounted(() => { loadData(); loadCategories() })

async function loadData() {
  loading.value = true
  try { const res = await api.getQuestions({ page: pagination.page, pageSize: pagination.pageSize, ...filters }); list.value = res.data.list; pagination.total = res.data.pagination.total } catch (e) { /* */ } finally { loading.value = false }
}
async function loadCategories() {
  try { const res = await api.getQuestionCategories(); categoryList.value = res.data.categories || [] } catch (e) { /* */ }
}

function openQuestionDialog(row = null) {
  if (row) { isEdit.value = true; editId.value = row.id; Object.assign(form, { title: row.title, content: row.content, type: row.type, difficulty: row.difficulty, category_id: row.category_id, reference_answer: row.reference_answer || '', tags: row.tags || '', score: row.score }) }
  else { isEdit.value = false; editId.value = null; Object.assign(form, { title: '', content: '', type: 'basic', difficulty: 'junior', category_id: categoryList.value[0]?.id || null, reference_answer: '', tags: '', score: 10 }) }
  dialogVisible.value = true
}
async function handleSaveQuestion() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { if (isEdit.value) { await api.updateQuestion(editId.value, form) } else { await api.createQuestion(form) }; ElMessage.success(isEdit.value ? '更新成功' : '创建成功'); dialogVisible.value = false; loadData() } catch (e) { /* */ }
}
async function handleDelete(id) { try { await api.deleteQuestion(id); ElMessage.success('删除成功'); loadData() } catch (e) { /* */ } }

function openCategoryDialog(row = null) {
  if (row) { catIsEdit.value = true; catEditId.value = row.id; Object.assign(catForm, row) }
  else { catIsEdit.value = false; catEditId.value = null; Object.assign(catForm, { name: '', description: '', sort_order: 0 }) }
  catDialogVisible.value = true
}
async function handleSaveCategory() {
  const valid = await catFormRef.value.validate().catch(() => false)
  if (!valid) return
  try { if (catIsEdit.value) { await api.updateCategory(catEditId.value, catForm) } else { await api.createCategory(catForm) }; ElMessage.success('保存成功'); catDialogVisible.value = false; loadCategories() } catch (e) { /* */ }
}
async function handleDeleteCategory(id) { try { await api.deleteCategory(id); ElMessage.success('删除成功'); loadCategories() } catch (e) { /* */ } }

async function handleImport() {
  try { const questions = JSON.parse(importJson.value); await api.batchImportQuestions({ questions }); ElMessage.success(`成功导入${questions.length}道题目`); showImport.value = false; importJson.value = ''; loadData() } catch (e) { ElMessage.error('JSON格式错误') }
}
</script>
