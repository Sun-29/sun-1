const app = getApp()

Page({
  data: {
    userInfo: {},
    stats: { totalInterviews: 0, avgScore: '0.0', totalPractice: 0 },
    menus: [
      { icon: '简', title: '简历分析', url: '/pages/sub/resume' },
      { icon: '路', title: '学习方案', url: '/pages/sub/learning-path' },
      { icon: '统', title: '学习统计', url: '/pages/sub/stats' },
      { icon: '错', title: '错题本', url: '/pages/sub/wrong-questions' },
      { icon: '项', title: '项目深挖', url: '/pages/sub/project-drill' },
      { icon: '信', title: '消息通知', url: '/pages/sub/messages' }
    ]
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
    this.loadStats()
  },

  async loadStats() {
    try {
      var res = await app.request({ url: '/stats/overview' })
      this.setData({ stats: res.data })
    } catch (e) {}
  },

  goToPage(e) {
    var url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url: url })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      success: function(res) {
        if (res.confirm) app.logout()
      }
    })
  }
})
