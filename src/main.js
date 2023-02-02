import App from '@/App.vue'
import router from '@/router'
import store from '@/stores'
import toolkits from '@/toolkits'
import { createApp } from 'vue'

createApp(App).use(router).use(store).use(toolkits).mount('#app')
