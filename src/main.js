import App from '@/App.vue'
import router from '@/router'
import store from '@/stores'
import { createApp } from 'vue'

createApp(App).use(router).use(store).mount('#app')
