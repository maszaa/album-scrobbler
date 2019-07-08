import axios from 'axios'

export default {
  urls: {
    releaseById: `${process.env.VUE_APP_API_URL}/discogs/release/`
  },

  getRelease: async function (id) {
    const response = await axios.get(`${this.urls.releaseById}${id}`, {
      headers: {
        last_fm_session_key: localStorage.getItem('lastFmSession')
      }
    })
    return response.data
  }
}
