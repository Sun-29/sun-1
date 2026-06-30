var app = getApp()

Page({
  data: {
    analyses: [],
    showDetail: false,
    currentAnalysis: null,
    uploading: false
  },

  onShow() {
    this.loadList()
  },

  async loadList() {
    try {
      var res = await app.request({ url: '/resumes', data: { pageSize: 20 } })
      this.setData({ analyses: res.data.list || [] })
    } catch (e) {}
  },

  uploadResume() {
    var that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'docx', 'doc'],
      success: function(fileRes) {
        var file = fileRes.tempFiles[0]
        if (file.size > 20 * 1024 * 1024) {
          wx.showToast({ title: '文件不能超过20MB', icon: 'none' })
          return
        }
        that.doUpload(file)
      }
    })
  },

  doUpload(file) {
    var that = this
    var token = app.globalData.token
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    this.setData({ uploading: true })
    wx.showLoading({ title: 'AI分析中...' })

    wx.uploadFile({
      url: 'http://localhost:3000/api/resumes/upload-and-analyze',
      filePath: file.path,
      name: 'resume',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: function(res) {
        wx.hideLoading()
        try {
          var data = JSON.parse(res.data)
          if (data.code === 200 || data.code === 201) {
            wx.showToast({ title: '简历分析完成', icon: 'success' })
            that.loadList()
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' })
          }
        } catch (e) {
          wx.showToast({ title: '服务器异常', icon: 'none' })
        }
        that.setData({ uploading: false })
      },
      fail: function(err) {
        wx.hideLoading()
        wx.showToast({ title: '上传失败，请检查网络', icon: 'none' })
        that.setData({ uploading: false })
      }
    })
  },

  viewDetail(e) {
    var id = e.currentTarget.dataset.id
    for (var i = 0; i < this.data.analyses.length; i++) {
      if (this.data.analyses[i].id === id) {
        var analysis = this.data.analyses[i]
        // Parse analysis_result JSON
        if (analysis.analysis_result && typeof analysis.analysis_result === 'string') {
          try { analysis.analysis_result = JSON.parse(analysis.analysis_result) } catch (e) {}
        }
        // Convert newline-separated strings to arrays for WXML rendering
        analysis.strengthList = (analysis.strengths || '').split('\n').filter(function(s) { return s.trim() })
        analysis.weaknessList = (analysis.weaknesses || '').split('\n').filter(function(s) { return s.trim() })
        analysis.suggestionList = (analysis.suggestions || '').split('\n').filter(function(s) { return s.trim() })
        analysis.keywordList = (analysis.keywords || '').split(',').filter(function(s) { return s.trim() })
        this.setData({ currentAnalysis: analysis, showDetail: true })
        break
      }
    }
  },

  closeDetail() {
    this.setData({ showDetail: false, currentAnalysis: null })
  }
})
