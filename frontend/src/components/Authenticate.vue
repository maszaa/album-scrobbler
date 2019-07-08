<template>
  <div class="jumbotron">
    <h1>{{ title }}</h1>
    <pulse-loader loading color="black"></pulse-loader>
  </div>
</template>

<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import lastfm from '../services/lastfm'

export default {
  name: 'Authenticate',
  components: {
    PulseLoader
  },
  data () {
    return {
      title: 'Authenticating...'
    }
  },
  async mounted () {
    const token = this.$route.query.token
    if (token) {
      await lastfm.authenticate(this.$store, token)
        .catch(async () => this.$router.push('/'))
      this.$router.push('/scrobble')
    } else {
      this.$router.push('/')
    }
  }

}
</script>
