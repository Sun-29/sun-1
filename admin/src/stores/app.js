import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const darkMode = ref(false)
  const loading = ref(false)

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('dark', darkMode.value)
  }
  function setLoading(val) { loading.value = val }

  return { sidebarCollapsed, darkMode, loading, toggleSidebar, toggleDarkMode, setLoading }
}, {
  persist: {
    key: 'admin-app',
    storage: localStorage,
    paths: ['sidebarCollapsed', 'darkMode']
  }
})
