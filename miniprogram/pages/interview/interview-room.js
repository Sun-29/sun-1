const app = getApp()
Page({
  data: {
    interviewId: '',
    interview: null,
    currentDetail: null,
    currentIndex: 0,
    totalCount: 0,
    answer: '',
    isFollowUp: false,
    isRecording: false,
    isCompleted: false,
    loading: true
  },
  onLoad(options) {
    this.setData({ interviewId: options.id })
    this.loadInterview()
  },
  async loadInterview() {
    try {
      const res = await app.request({ url: `/interviews/${this.data.interviewId}` })
      const interview = res.data.interview
      const details = interview.details || []
      this.setData({
        interview, totalCount: interview.question_count,
        currentIndex: interview.current_question_index || 0, loading: false
      })
      if (interview.status === 'pending') {
        await app.request({ url: `/interviews/${interview.id}/start`, method: 'PUT' })
      }
      const idx = this.data.currentIndex
      const detail = details.find(d => d.question_order === idx + 1 && !d.user_answer)
      if (detail) {
        this.setData({ currentDetail: detail, isFollowUp: !!detail.is_follow_up })
      } else {
        this.setData({ isCompleted: true })
      }
    } catch (e) { this.setData({ loading: false }) }
  },
  onAnswerInput(e) { this.setData({ answer: e.detail.value }) },
  noop() {},
  hideKeyboard() {
    wx.hideKeyboard()
  },
  async submitAnswer() {
    this.hideKeyboard()
    const { answer, currentDetail, interviewId } = this.data
    if (!answer.trim()) { wx.showToast({ title: '请输入答案', icon: 'none' }); return }
    wx.showLoading({ title: 'AI评分中...' })
    try {
      const res = await app.request({
        url: '/interviews/answer', method: 'POST',
        data: { interview_id: parseInt(interviewId), detail_id: currentDetail.id, answer }
      })
      wx.hideLoading()
      if (res.data.isComplete) {
        this.setData({ isCompleted: true })
      } else {
        this.setData({ currentIndex: this.data.currentIndex + 1, answer: '' })
        this.loadInterview()
      }
    } catch (e) { wx.hideLoading() }
  },
  async skipQuestion() {
    this.hideKeyboard()
    try {
      await app.request({ url: `/interviews/${this.data.interviewId}/skip`, method: 'POST' })
      this.setData({ currentIndex: this.data.currentIndex + 1, answer: '' })
      this.loadInterview()
    } catch (e) {}
  },
  async completeInterview() {
    wx.showLoading({ title: '生成报告...' })
    try {
      await app.request({ url: `/interviews/${this.data.interviewId}/complete`, method: 'POST' })
      wx.hideLoading()
      wx.redirectTo({ url: `/pages/interview/report?id=${this.data.interviewId}` })
    } catch (e) { wx.hideLoading() }
  },
  startRecording() {
    this.setData({ isRecording: true })
    wx.showToast({ title: '录音功能开发中', icon: 'none' })
    setTimeout(() => this.setData({ isRecording: false }), 2000)
  }
})
