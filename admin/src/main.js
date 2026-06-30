import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

const app = createApp(App)

// Pinia with persistence
const pinia = createPinia()
pinia.use(piniaPersistedstate)
app.use(pinia)

// Router
app.use(router)

// Element Plus with Chinese locale
app.use(ElementPlus, { locale: zhCn, size: 'default' })

// Register all icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
