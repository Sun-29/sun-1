const app = getApp()

Page({
  data: {
    account: '',
    password: '',
    loading: false,
    loginMode: 'account' // 'account' | 'register'
  },

  onLoad() {
    // If already logged in, go directly to home
    if (app.globalData.isLoggedIn) {
      wx.redirectTo({ url: '/pages/home/home' })
    }
  },

  onAccountInput(e) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  switchMode() {
    const next = this.data.loginMode === 'account' ? 'register' : 'account'
    this.setData({ loginMode: next, account: '', password: '' })
  },

  setMode(e) {
    const mode = e.currentTarget.dataset.mode
    if (!mode || mode === this.data.loginMode) return
    this.setData({ loginMode: mode, account: '', password: '' })
  },

  noop() {},

  hideKeyboard() {
    wx.hideKeyboard()
  },

  /** Account + password login */
  async handleLogin() {
    this.hideKeyboard()
    const { account, password } = this.data
    if (!account.trim()) {
      wx.showToast({ title: '请输入手机号或邮箱', icon: 'none' })
      return
    }
    if (!password.trim()) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    try {
      if (this.data.loginMode === 'account') {
        await app.login(account.trim(), password)
      } else {
        await app.register({ phone: account.trim(), password: password, nickname: '新用户' })
      }
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/home/home' })
      }, 500)
    } catch (e) {
      // Error toast already shown by app.request
      console.log('[Login] failed:', e)
    } finally {
      this.setData({ loading: false })
    }
  },

  /** WeChat one-click login */
  async handleWechatLogin() {
    this.setData({ loading: true })
    try {
      await app.wechatLogin()
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/home/home' })
      }, 500)
    } catch (e) {
      console.log('[WechatLogin] failed:', e)
      wx.showToast({ title: '微信登录失败，请使用账号登录', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
