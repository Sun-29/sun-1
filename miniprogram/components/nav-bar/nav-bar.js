Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    backgroundColor: { type: String, value: '#2764E8' },
    textColor: { type: String, value: '#ffffff' }
  },
  data: {},
  methods: {
    goBack() {
      wx.navigateBack({
        fail: () => {
          wx.redirectTo({ url: '/pages/home/home' })
        }
      })
    }
  }
})
