const app = getApp()

Page({
  data: {
    type: 'total',
    types: [
      { label: '周榜', value: 'week' },
      { label: '月榜', value: 'month' },
      { label: '总榜', value: 'total' }
    ],
    rankings: [],
    myRank: null
  },

  onLoad() {
    this.loadRankings()
    this.loadMyRank()
  },

  switchType(e) {
    this.setData({ type: e.currentTarget.dataset.type }, function() {
      this.loadRankings()
    }.bind(this))
  },

  async loadRankings() {
    try {
      var res = await app.request({ url: '/rankings', data: { type: this.data.type, pageSize: 20 } })
      this.setData({ rankings: res.data.list || [] })
    } catch (e) {}
  },

  async loadMyRank() {
    try {
      var res = await app.request({ url: '/rankings/me' })
      this.setData({ myRank: res.data.rank })
    } catch (e) {}
  }
})
