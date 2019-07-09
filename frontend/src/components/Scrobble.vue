<template>
  <div>
    <div class="jumbotron">
      <h1>Scrobble album</h1>
      <p>Give Discogs release ID to fetch album info</p>
      <input type="number" v-model="releaseId">
      <button :disabled="!releaseId" v-on:click="getDiscogsRelease()" class="btn btn-success ml-2">Get release</button>
      <hr>
      <p>Select starting time and tracks to scrobble</p>
      <input type="datetime-local" v-model="startTime" required>
      <hr>
      <button :disabled="!readyToScrobble()" v-on:click="scrobbleTracks()" class="btn btn-danger">Scrobble</button>
    </div>
    <pulse-loader :loading="$store.state.busy" color="white"></pulse-loader>
    <pre v-if="success" class="text-left font-weight-bold text-success">{{ success }}</pre>
    <pre v-if="error" class="text-left font-weight-bold text-danger">{{ error }}</pre>
    <div v-if="releaseFetched()">
      <div class="album-info">
        <h3>{{ album.artist }}</h3>
        <h4>{{ album.title }}</h4>
        <h5>{{ album.year }}</h5>
        <button v-on:click="selectAllTracks()" class="btn btn-primary">Select All</button>
        <button v-on:click="clearSelectedTracks()" class="btn btn-primary ml-2">Clear</button>
      </div>
      <img v-if="album.cover" :src="album.cover" class="cover" />
      <table class="table table-bordered tracks">
        <thead>
          <tr>
            <th>Select</th>
            <th>Position</th>
            <th>Title</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(track, index) in album.tracks" :key="index">
            <td><input v-if="track.index !== null && track.index !== undefined" type="checkbox" name="selectedTracks" :value=track v-model="selectedTracks" /></td>
            <td>{{ track.position }}</td>
            <td>{{ track.title }}</td>
            <td>{{ formatDuration(track.duration) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

import discogs from '../services/discogs'
import lastfm from '../services/lastfm'

export default {
  name: 'Scrobble',
  components: {
    PulseLoader
  },
  data () {
    return {
      releaseId: null,
      startTime: moment().format('YYYY-MM-DDTHH:mm'),
      album: {
        artist: null,
        title: null,
        year: null,
        tracks: [],
        cover: null
      },
      selectedTracks: [],
      error: null,
      success: null
    }
  },
  methods: {
    getDiscogsRelease: async function () {
      this.$store.commit('toggleBusy', true)
      this.clearStatus()
      this.selectedTracks = []
      try {
        this.album = await discogs.getRelease(this.releaseId)
      } catch (err) {
        this.error = err.response ? err.response.data.message : err
      }
      this.$store.commit('toggleBusy', false)
    },
    formatDuration: function (duration) {
      return duration ? `${Math.floor(duration / 60)}:${duration % 60 < 10 ? `0${duration % 60}` : duration % 60}` : ''
    },
    releaseFetched: function () {
      return this.album && this.album.tracks.length !== 0
    },
    readyToScrobble: function () {
      return this.selectedTracks.length !== 0 && moment(this.startTime).isValid()
    },
    clearStatus: function () {
      this.error = null
      this.success = null
    },
    scrobbleTracks: async function () {
      this.$store.commit('toggleBusy', true)
      this.clearStatus()

      try {
        const response = await lastfm.scrobbleMultiple(this.album.discogsId, this.startTime, this.selectedTracks)
        this.startTime = response.data.startTime

        this.success = `Scrobbled ${response.data.scrobbles['@attr'].accepted} tracks`
        if (response.data.scrobbles['@attr'].ignored > 0) {
          this.error = `Following tracks were ignored:\n`
          if (Array.isArray(response.data.scrobbles.scrobble)) {
            response.data.scrobbles.scrobble.forEach((scrobble) => {
              this.error += `${scrobble.track['#text']} - Reason: ${scrobble.ignoredMessage.code}\n`
            })
          } else {
            this.error += `${response.data.scrobbles.scrobble.track['#text']} - Reason: ${response.data.scrobbles.scrobble.ignoredMessage.code}\n`
          }
        }
      } catch (err) {
        this.error = err
      }

      this.$store.commit('toggleBusy', false)
    },
    selectAllTracks: function () {
      this.selectedTracks = this.album.tracks.filter((track) => track.duration && track.index !== null && track.index !== undefined)
    },
    clearSelectedTracks: function () {
      this.selectedTracks = []
    }
  },
  watch: {
    selectedTracks: function (selectedTracks) {
      // Only 50 srobbles per occasion allowed by Last.fm
      if (selectedTracks.length > 50) {
        this.selectedTracks = this.selectedTracks.slice(0, 50)
        this.error = 'Only 50 srobbles per occasion are allowed by Last.fm, I limited them for you :)'
      }
    }
  },
  mounted () {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
div.album-info {
  float: left;
  text-align: left;
}
img.cover {
  float: right;
  margin: 0px 0px 10px 0px;
}
table.tracks {
  text-align: left;
  color: #ffffff;
}
</style>
