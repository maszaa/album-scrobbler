// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'

import App from './App'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(Vuex)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    lastFmSession: null,
    user: null,
    busy: false
  },
  getters: {
    isAuthenticated: function (state) {
      return state.lastFmSession != null
    }
  },
  mutations: {
    async initialize () {
      const lastFmSession = localStorage.getItem('lastFmSession')
      const user = localStorage.getItem('user')

      if (lastFmSession && user) {
        this.commit('authenticate', {
          lastFmSession: lastFmSession,
          user: user
        })
      }
    },
    authenticate (state, data) {
      state.lastFmSession = data.lastFmSession
      state.user = data.user
      localStorage.setItem('lastFmSession', state.lastFmSession)
      localStorage.setItem('user', state.user)
    },
    logout (state) {
      state.lastFmSession = null
      state.user = null
      localStorage.removeItem('lastFmSession')
      localStorage.removeItem('user')
    },
    toggleBusy (state, busy) {
      if (typeof busy === 'boolean') {
        state.busy = busy
      }
    },
  },
  actions: {
    initialize (context) {
      context.commit('initialize')
    },
    authenticate (context, data) {
      context.commit('authenticate', data)
    },
    logout (context) {
      context.commit('logout')
    },
    toggleBusy (context, busy) {
      context.commit('toggleBusy', busy)
    }
  }
})

/* eslint-disable no-new */
new Vue({
  router,
  store,
  async beforeCreate () {
    await this.$store.commit('initialize')
  },
  render: h => h(App),
}).$mount('#app')
