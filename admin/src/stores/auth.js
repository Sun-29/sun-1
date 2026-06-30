import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getProfile } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const admin = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    const res = await apiLogin(username, password)
    token.value = res.data.token
    admin.value = res.data.admin
    return res
  }

  async function fetchProfile() {
    try {
      const res = await getProfile()
      admin.value = res.data.admin
    } catch (e) {
      logout()
    }
  }

  function logout() {
    token.value = ''
    admin.value = null
  }

  return { token, admin, isAuthenticated, login, logout, fetchProfile }
}, {
  persist: {
    key: 'admin-auth',
    storage: localStorage,
    paths: ['token', 'admin']
  }
})
