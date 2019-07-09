<template>
  <div id="app">
    <div v-if="this.$store.getters.isAuthenticated" class="header">
      Authenticated as <a :href="lastFmUrl" class="text-danger">{{ this.$store.state.user }}</a>
      <button v-on:click="logOut()" class="btn btn-danger logout">Logout</button><br>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  computed: {
    lastFmUrl: function () {
      return `http://last.fm/user/${this.$store.state.user}`
    }
  },
  methods: {
    logOut: function () {
      this.$store.commit('logout')
      this.$router.push('/')
    }
  }
}
</script>

<style>
body {
  background-color: #000000;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  width: 60%;
  min-width: 300pt;
  margin: 10px auto auto auto;
}
div.header {
  text-align: right !important;
}
button.logout {
  margin: 0px 0px 5px 5px;
}
.jumbotron {
  background-color: #1a1a1a;
}
hr {
  background-color: #ffffff;
}
</style>
