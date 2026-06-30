const app = getApp()

Page({
  data: {
    positions: [],
    selectedPosition: null,
    difficulty: 'junior',
    duration: 30,
    questionCount: 5,
    difficulties: [
      { value: 'junior', label: '初级', desc: '适合入门学习者' },
      { value: 'mid', label: '中级', desc: '有一定基础的学习者' },
      { value: 'senior', label: '高级', desc: '挑战高难度面试' }
    ]
  },

  onLoad() {
    this.loadPositions()
  },

  async loadPositions() {
    try {
      const res = await app.request({ url: '/positions', data: { pageSize: 50 } })
      this.setData({ positions: res.data.list || [] })
    } catch (e) { /* */ }
  },

  selectPosition(e) {
    const id = e.currentTarget.dataset.id
    const pos = this.data.positions.find(function(p) { return p.id === id })
    this.setData({ selectedPosition: pos })
  },

  selectDifficulty(e) {
    this.setData({ difficulty: e.currentTarget.dataset.value })
  },

  setDuration(e) {
    this.setData({ duration: parseInt(e.detail.value) })
  },

  setQuestionCount(e) {
    this.setData({ questionCount: parseInt(e.detail.value) })
  },

  async startInterview() {
    if (!this.data.selectedPosition) {
      wx.showToast({ title: '请选择岗位', icon: 'none' })
      return
    }
    wx.showLoading({ title: 'AI生成题目中...' })
    try {
      const res = await app.request({
        url: '/interviews',
        method: 'POST',
        data: {
          position_id: this.data.selectedPosition.id,
          difficulty: this.data.difficulty,
          duration: this.data.duration,
          question_count: this.data.questionCount
        }
      })
      wx.hideLoading()
      wx.navigateTo({ url: '/pages/interview/interview-room?id=' + res.data.interview.id })
    } catch (e) {
      wx.hideLoading()
    }
  }
})
