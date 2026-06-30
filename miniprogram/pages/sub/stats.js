const app = getApp()
Page({
  data: { overview: {}, dailyStats: [] },
  onShow() { this.loadData() },
  async loadData() {
    try {
      var overviewRes = await app.request({ url: '/stats/overview' })
      var dailyRes = await app.request({ url: '/stats/daily', data: { startDate: '', endDate: '' } })
      this.setData({ overview: overviewRes.data, dailyStats: dailyRes.data.list || [] })
    } catch (e) {}
  }
})
