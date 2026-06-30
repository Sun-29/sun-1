const app = getApp()

Page({
  data: {
    interviewId: '',
    interview: null,
    report: null,
    loading: true,
    scores: []
  },

  onLoad(options) {
    this.setData({ interviewId: options.id })
    this.loadReport()
  },

  async loadReport() {
    try {
      var res = await app.request({ url: '/interviews/' + this.data.interviewId + '/report' })
      var report = res.data.report
      var scores = [
        { label: '专业知识(40%)', score: report.professional_score },
        { label: '表达能力(20%)', score: report.expression_score },
        { label: '逻辑思维(20%)', score: report.logic_score },
        { label: '问题理解(20%)', score: report.understanding_score }
      ]
      this.setData({ interview: res.data.interview, report: report, scores: scores, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  async generateLearningPath() {
    wx.showLoading({ title: 'AI生成学习方案...' })
    try {
      var res = await app.request({
        url: '/learning/generate',
        method: 'POST',
        data: { interview_id: parseInt(this.data.interviewId) }
      })
      wx.hideLoading()
      wx.showToast({ title: '学习方案已生成', icon: 'success' })
      setTimeout(function() {
        wx.navigateTo({ url: '/pages/sub/learning-path' })
      }, 800)
    } catch (e) {
      wx.hideLoading()
    }
  }
})
