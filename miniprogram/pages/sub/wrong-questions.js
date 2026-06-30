const app = getApp()
Page({
  data: { wrongQuestions: [], loading: false },
  onShow() { this.loadData() },
  async loadData() {
    this.setData({ loading: true })
    try {
      var res = await app.request({ url: '/questions/wrong', data: { pageSize: 50 } })
      this.setData({ wrongQuestions: res.data.list || [], loading: false })
    } catch (e) { this.setData({ loading: false }) }
  },
  async reviewAgain(e) {
    var id = e.currentTarget.dataset.id
    try {
      await app.request({ url: '/questions/' + id + '/review-wrong', method: 'POST' })
      wx.showToast({ title: '已复习', icon: 'success' }); this.loadData()
    } catch (e) {}
  },
  async markMastered(e) {
    var id = e.currentTarget.dataset.id
    try {
      await app.request({ url: '/questions/' + id + '/master-wrong', method: 'PUT' })
      wx.showToast({ title: '已掌握', icon: 'success' }); this.loadData()
    } catch (e) {}
  }
})
