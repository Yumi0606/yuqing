import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import { BootstrapVue3 } from 'bootstrap-vue-3'

// 引入 FontAwesome
import '@fortawesome/fontawesome-free/css/all.css'

// 引入全局样式
import './assets/css/main.css'

const app = createApp(App)

app.use(router)
   .use(store)
   .use(BootstrapVue3)
   .mount('#app') 