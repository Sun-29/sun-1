import { get, post, put, del } from './request'

// Auth
export const login = (username, password) => post('/auth/admin/login', { username, password })
export const getProfile = () => get('/profile')

// Dashboard
export const getDashboardStats = () => get('/admin/dashboard/stats')
export const getUserTrend = () => get('/admin/dashboard/user-trend')
export const getInterviewTrend = () => get('/admin/dashboard/interview-trend')
export const getPositionPopularity = () => get('/admin/dashboard/position-popularity')
export const getScoreDistribution = () => get('/admin/dashboard/score-distribution')
export const getRecentActivities = () => get('/admin/dashboard/recent-activities')

// Users
export const getUsers = (params) => get('/admin/users', params)
export const getUserDetail = (id) => get(`/admin/users/${id}`)
export const updateUserStatus = (id, status) => put(`/admin/users/${id}/status`, { status })
export const deleteUser = (id) => del(`/admin/users/${id}`)
export const getUserStats = () => get('/admin/users/stats')

// Positions
export const getPositions = (params) => get('/positions', params)
export const createPosition = (data) => post('/positions', data)
export const updatePosition = (id, data) => put(`/positions/${id}`, data)
export const deletePosition = (id) => del(`/positions/${id}`)
export const getPositionCategories = () => get('/positions/categories')

// Questions
export const getQuestions = (params) => get('/admin/questions', params)
export const getQuestionDetail = (id) => get(`/admin/questions/${id}`)
export const createQuestion = (data) => post('/admin/questions', data)
export const updateQuestion = (id, data) => put(`/admin/questions/${id}`, data)
export const deleteQuestion = (id) => del(`/admin/questions/${id}`)
export const batchImportQuestions = (data) => post('/admin/questions/batch-import', data)
export const exportQuestions = (params) => get('/admin/questions/export', params)
export const getQuestionCategories = () => get('/admin/questions/categories')
export const createCategory = (data) => post('/admin/questions/categories', data)
export const updateCategory = (id, data) => put(`/admin/questions/categories/${id}`, data)
export const deleteCategory = (id) => del(`/admin/questions/categories/${id}`)

// Interviews
export const getInterviews = (params) => get('/admin/interviews', params)
export const getInterviewDetail = (id) => get(`/admin/interviews/${id}`)
export const getInterviewStats = () => get('/admin/interviews/stats')
export const exportInterviews = (params) => get('/admin/interviews/export', params)

// Resumes
export const getResumes = (params) => get('/admin/resumes', params)
export const getResumeDetail = (id) => get(`/admin/resumes/${id}`)
export const deleteResume = (id) => del(`/admin/resumes/${id}`)
export const downloadResume = (id) => get(`/admin/resumes/${id}/download`)

// Messages
export const broadcastMessage = (data) => post('/admin/messages/broadcast', data)
export const getAdminMessages = (params) => get('/admin/messages', params)

// System
export const getSystemLogs = (params) => get('/admin/system/logs', params)
export const getSystemConfig = () => get('/admin/system/config')
export const updateSystemConfig = (data) => put('/admin/system/config', data)
