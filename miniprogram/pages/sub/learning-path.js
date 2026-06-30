var app = getApp()

Page({
  data: {
    paths: [],
    currentPath: null,
    showDetail: false
  },

  onShow() {
    this.loadPaths()
  },

  async loadPaths() {
    try {
      var res = await app.request({ url: '/learning', data: { pageSize: 10 } })
      this.setData({ paths: res.data.list || [] })
    } catch (e) {}
  },

  viewPath(e) {
    var id = e.currentTarget.dataset.id
    for (var i = 0; i < this.data.paths.length; i++) {
      if (this.data.paths[i].id === id) {
        var path = this.data.paths[i]
        // path_data is the AI-generated object
        if (path.path_data && typeof path.path_data === 'string') {
          try { path.path_data = JSON.parse(path.path_data) } catch (e) {}
        }
        this.setData({ currentPath: path, showDetail: true })
        break
      }
    }
  },

  closeDetail() {
    this.setData({ showDetail: false, currentPath: null })
  }
})
