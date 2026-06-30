Component({
  properties: {
    active: { type: String, value: 'home' }
  },

  data: {
    tabs: [
      { key: 'home', label: '首页', icon: '首', page: '/pages/home/home' },
      { key: 'question', label: '题库', icon: '题', page: '/pages/question-bank/question-bank' },
      { key: 'ranking', label: '排行', icon: '榜', page: '/pages/ranking/ranking' },
      { key: 'profile', label: '我的', icon: '我', page: '/pages/profile/profile' }
    ]
  },

  methods: {
    switchTab(e) {
      const page = e.currentTarget.dataset.page
      if (!page) return
      // Use redirectTo since we use a custom tab-bar component, not native tabBar
      wx.redirectTo({ url: page })
    }
  }
})
