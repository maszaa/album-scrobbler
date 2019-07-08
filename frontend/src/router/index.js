import Vue from 'vue'
import Router from 'vue-router'

import Welcome from '@/components/Welcome'
import Authenticate from '@/components/Authenticate'
import Scrobble from '@/components/Scrobble'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/authenticate',
      name: 'Authenticate',
      component: Authenticate
    },
    {
      path: '/scrobble',
      name: 'Scrobble',
      component: Scrobble
    }
  ]
})
