const app = getApp()
Page({
  data: { projectName: '', projectDesc: '', drills: [] },
  onShow() {
    app.request({ url: '/projects/history' }).then(function(res) {
      this.setData({ drills: res.data.list || [] })
    }.bind(this)).catch(function() {})
  },
  onNameInput(e) { this.setData({ projectName: e.detail.value }) },
  onDescInput(e) { this.setData({ projectDesc: e.detail.value }) },
  noop() {},
  hideKeyboard() {
    wx.hideKeyboard()
  },
  async startDrill() {
    this.hideKeyboard()
    if (!this.data.projectName) { wx.showToast({ title: '请输入项目名称', icon: 'none' }); return }
    wx.showLoading({ title: 'AI生成问题中...' })
    try {
      var res = await app.request({
        url: '/projects/drill', method: 'POST',
        data: { project_name: this.data.projectName, project_description: this.data.projectDesc }
      })
      wx.hideLoading()
      wx.navigateTo({ url: '/pages/interview/interview-room?id=' + res.data.interview.id })
    } catch (e) { wx.hideLoading() }
  }
})
