const BASE_URL = 'http://localhost:3000/api'

App({
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    token: null
  },

  onLaunch() {
    console.log('[App] launched')
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        this.globalData.isLoggedIn = true
        console.log('[App] Restored login state')
      }
    } catch (e) {
      console.log('[App] No saved login state')
    }
  },

  request({ url, method = 'GET', data = {}, header = {} }) {
    return new Promise((resolve, reject) => {
      const finalHeader = { 'Content-Type': 'application/json', ...header }
      if (this.globalData.token) {
        finalHeader['Authorization'] = 'Bearer ' + this.globalData.token
      }
      wx.request({
        url: BASE_URL + url,
        method,
        data,
        header: finalHeader,
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            this.clearLoginState()
            wx.reLaunch({ url: '/pages/index/index' })
            reject(res.data)
          } else {
            wx.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(res.data)
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误，请检查后端服务', icon: 'none' })
          reject(err)
        }
      })
    })
  },

  login(account, password) {
    return this.request({
      url: '/auth/login',
      method: 'POST',
      data: { account, password }
    }).then(res => {
      this.saveLoginState(res.data.user, res.data.token)
      return res.data
    })
  },

  wechatLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          this.request({
            url: '/auth/wechat-login',
            method: 'POST',
            data: { openid: loginRes.code, nickname: '', avatarUrl: '' }
          }).then(res => {
            this.saveLoginState(res.data.user, res.data.token)
            resolve(res.data)
          }).catch(reject)
        },
        fail: reject
      })
    })
  },

  register(data) {
    return this.request({
      url: '/auth/register',
      method: 'POST',
      data
    }).then(res => {
      this.saveLoginState(res.data.user, res.data.token)
      return res.data
    })
  },

  saveLoginState(user, token) {
    this.globalData.isLoggedIn = true
    this.globalData.userInfo = user
    this.globalData.token = token
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', user)
  },

  clearLoginState() {
    this.globalData.isLoggedIn = false
    this.globalData.userInfo = null
    this.globalData.token = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  logout() {
    this.clearLoginState()
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
