import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/About.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/Settings.vue')
    },
    {
      path: '/wnr',
      name: 'timer',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/Timer.vue')
    },
    {
      path: '/androidTips1',
      name: 'AndroidTips1',
      component: () => import('./views/AndroidTips/AndroidTips1.vue')
    },
    {
      path: '/androidTips2',
      name: 'AndroidTips2',
      component: () => import('./views/AndroidTips/AndroidTips2.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('./views/Error.vue')
    },
    {
      path: '*',    // 404 for error
      redirect: '/404'
    }
  ]
})
