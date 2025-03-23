import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import element from './plugins/element' // 确保引入正确

const app = createApp(App)

app.use(router)
   .use(store)
   .use(element) // 使用 Element Plus 插件
   .mount('#app') 