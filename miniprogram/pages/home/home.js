const app = getApp()

Page({
  data: {
    userInfo: {},
    banners: [
      { title: 'AI智能面试', desc: '模拟真实面试场景', icon: 'AI', color: '#2764E8', url: '/pages/interview/interview' },
      { title: '简历分析', desc: 'AI优化你的简历', icon: '简', color: '#12B886', url: '/pages/sub/resume' },
      { title: '项目深挖', desc: '深度项目答辩训练', icon: '项', color: '#F59F00', url: '/pages/sub/project-drill' },
      { title: '学习方案', desc: 'AI定制学习计划', icon: '学', color: '#7C3AED', url: '/pages/sub/learning-path' }
    ],
    stats: { totalInterviews: 0, avgScore: '0.0', totalPractice: 0, rank: null },
    recentInterviews: []
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadStats()
    this.loadRecentInterviews()
  },

  async loadStats() {
    try {
      const res = await app.request({ url: '/stats/overview' })
      this.setData({ stats: res.data })
    } catch (e) { /* server not ready */ }
  },

  async loadRecentInterviews() {
    try {
      const res = await app.request({ url: '/interviews', data: { pageSize: 3 } })
      this.setData({ recentInterviews: res.data.list || [] })
    } catch (e) { /* server not ready */ }
  },

  goToPage(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  goToInterview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/interview/report?id=' + id })
  },

  startInterview() {
    wx.navigateTo({ url: '/pages/interview/interview' })
  }
})
