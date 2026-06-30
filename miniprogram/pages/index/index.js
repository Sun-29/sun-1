const app = getApp()

Page({
  onLoad() {
    if (app.globalData.isLoggedIn) {
      wx.redirectTo({ url: '/pages/home/home' })
    }
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  }
})
