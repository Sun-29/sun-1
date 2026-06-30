const app = getApp()
Page({
  data: { messages: [], unreadCount: 0 },
  onShow() { this.loadData() },
  async loadData() {
    try {
      var listRes = await app.request({ url: '/messages', data: { pageSize: 50 } })
      var countRes = await app.request({ url: '/messages/unread-count' })
      this.setData({ messages: listRes.data.list || [], unreadCount: countRes.data.count || 0 })
    } catch (e) {}
  },
  async markRead(e) {
    var id = e.currentTarget.dataset.id
    try { await app.request({ url: '/messages/' + id + '/read', method: 'PUT' }); this.loadData() } catch (e) {}
  },
  async markAllRead() {
    try { await app.request({ url: '/messages/read-all', method: 'PUT' }); this.loadData() } catch (e) {}
  }
})
