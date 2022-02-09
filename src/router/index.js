import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../components/Index.vue'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import User from '../components/user/User.vue'
import Address from '../components/user/Address.vue'
import Needs from '../components/needs/Needs.vue'
import Account from '../components/bill/Account.vue'
import Ad from '../components/data/Ad.vue'
import Withdrawal from '../components/bill/Withdrawal.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: 'login' },
  { path: '/login', component: Login },
  {
    path: '/index',
    component: Index,
    redirect: 'home',
    children: [
      { path: '/home', component: Home },
      { path: '/user', component: User },
      { path: '/address', component: Address },
      { path: '/needs', component: Needs },
      { path: '/account', component: Account },
      { path: '/ad', component: Ad },
      { path: '/withdrawal', component: Withdrawal }
    ]
  }

]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
