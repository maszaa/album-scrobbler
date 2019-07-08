<template>
  <div class="jumbotron">
    <h1>{{title}}</h1>
    <h3>{{message}}</h3>
    <hr>
    <a v-if="!this.$store.getters.isAuthenticated" :href="authenticateUrl" class="btn btn-danger">{{buttonText}}</a>
    <router-link to="scrobble" v-else class="btn btn-danger">{{buttonText}}</router-link>
  </div>
</template>

<script>
import lastfm from '../services/lastfm'

export default {
  name: 'Welcome',
  data () {
    return {
      title: 'Welcome to Album Scrobbler!',
      authenticateUrl: lastfm.urls.authenticate
    }
  },
  computed: {
    message: function () {
      return this.$store.getters.isAuthenticated ? 'Start scrobbling' : 'Authenticate to Last.fm for scrobbling'
    },
    buttonText: function () {
      return this.$store.getters.isAuthenticated ? 'Scrobble album' : 'Authenticate'
    }
  }
}
</script>
