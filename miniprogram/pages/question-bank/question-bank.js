const app = getApp()

Page({
  data: {
    categories: [],
    questions: [],
    activeCategory: null,
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadCategories()
    this.loadQuestions()
  },

  async loadCategories() {
    try {
      const catRes = await app.request({ url: '/admin/questions/categories' })
      this.setData({ categories: catRes.data.categories || [] })
    } catch (e) {
      this.setData({ categories: [
        { id: 1, name: 'Java' }, { id: 2, name: 'Python' }, { id: 3, name: 'MySQL' },
        { id: 4, name: 'Redis' }, { id: 5, name: 'Vue' }, { id: 6, name: 'React' }
      ]})
    }
  },

  async loadQuestions() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })
    try {
      var activeCategory = this.data.activeCategory
      var page = this.data.page
      var params = { page: page, pageSize: 10 }
      if (activeCategory) params.category_id = activeCategory
      var res = await app.request({ url: '/questions', data: params })
      var newList = page === 1 ? res.data.list : this.data.questions.concat(res.data.list)
      this.setData({
        questions: newList,
        hasMore: res.data.list.length >= 10,
        page: page,
        loading: false
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  selectCategory(e) {
    var id = e.currentTarget.dataset.id
    this.setData({ activeCategory: id, page: 1, questions: [], hasMore: true }, function() {
      this.loadQuestions()
    }.bind(this))
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 }, function() {
      this.loadQuestions()
    }.bind(this))
  },

  toggleFavorite(e) {
    var id = e.currentTarget.dataset.id
    var questions = this.data.questions.map(function(item) {
      if (String(item.id) === String(id)) item.isFavorited = !item.isFavorited
      return item
    })
    this.setData({ questions: questions })
    app.request({ url: '/questions/' + id + '/favorite', method: 'POST' }).then(function() {
      wx.showToast({ title: '已更新', icon: 'success' })
    }).catch(function() {
      var rollback = questions.map(function(item) {
        if (String(item.id) === String(id)) item.isFavorited = !item.isFavorited
        return item
      })
      this.setData({ questions: rollback })
    }.bind(this))
  }
})
