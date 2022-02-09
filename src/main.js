import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import dragDialog from './assets/js/dragDialog.js'

// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'

// 配置请求的跟路径
axios.defaults.baseURL = ''
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
}, error => error)
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(dragDialog)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
