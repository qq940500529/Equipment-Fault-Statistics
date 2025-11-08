import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import App from './App.vue'
import router from './router'

// Import Arco Design styles
import '@arco-design/web-vue/dist/arco.css'

// Import custom styles
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ArcoVue)

app.mount('#app')

console.log('Equipment Fault Statistics System v0.5.0 (Vue 3 + Arco Design)')
