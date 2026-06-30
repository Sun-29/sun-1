<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>岗位管理</span>
          <el-button type="primary" @click="openDialog()">新增岗位</el-button>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="name" label="岗位名称" width="160" />
        <el-table-column label="分类" width="100">
          <template #default="{ row }"><el-tag>{{ categoryMap[row.category] || row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="salary_range" label="薪资范围" width="120" />
        <el-table-column prop="sort_order" label="排序" width="60" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑岗位' : '新增岗位'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width:100%">
            <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="要求"><el-input v-model="form.requirements" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="薪资范围"><el-input v-model="form.salary_range" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort_order" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = reactive({ name: '', category: 'dev', description: '', requirements: '', salary_range: '', sort_order: 0 })
const rules = { name: [{ required: true, message: '请输入名称' }], category: [{ required: true, message: '请选择分类' }] }
const categories = [
  { value: 'dev', label: '开发岗' }, { value: 'test', label: '测试岗' }, { value: 'ops', label: '运维岗' },
  { value: 'product', label: '产品岗' }, { value: 'data', label: '数据岗' }
]
const categoryMap = { dev: '开发岗', test: '测试岗', ops: '运维岗', product: '产品岗', data: '数据岗' }

onMounted(() => loadData())
async function loadData() {
  loading.value = true
  try { const res = await api.getPositions({ pageSize: 100 }); list.value = res.data.list } catch (e) { /* */ } finally { loading.value = false }
}

function openDialog(row = null) {
  if (row) { isEdit.value = true; editId.value = row.id; Object.assign(form, row) }
  else { isEdit.value = false; editId.value = null; Object.assign(form, { name: '', category: 'dev', description: '', requirements: '', salary_range: '', sort_order: 0 }) }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (isEdit.value) { await api.updatePosition(editId.value, form) } else { await api.createPosition(form) }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false; loadData()
  } catch (e) { /* */ }
}

async function handleDelete(id) {
  try { await api.deletePosition(id); ElMessage.success('删除成功'); loadData() } catch (e) { /* */ }
}
</script>
