import axios from 'axios'
import moment from 'moment'

export default {
  urls: {
    authenticate: `https://www.last.fm/api/auth/?api_key=${process.env.VUE_APP_LAST_FM_KEY}&cb=${process.env.VUE_APP_LAST_FM_CALLBACK_URL}`,
    getSession: `${process.env.VUE_APP_API_URL}/lastFm/authenticate?token=`,
    scrobble: `${process.env.VUE_APP_API_URL}/lastFm/scrobble`,
    enableHeosScrobbling: `${process.env.VUE_APP_API_URL}/lastFm/scrobble/heos`,
  },

  authenticate: async function (store, token) {
    const response = await axios.get(`${this.urls.getSession}${token}`)

    store.commit('authenticate', {
      lastFmSession: response.data.session.key,
      user: response.data.session.name
    })
  },

  scrobbleMultiple: function (discogsId, startTime, tracks) {
    if (!discogsId) throw new Error('DiscogsId missing')
    if (!startTime || !moment(startTime).isValid()) throw new Error('Missing or invalid startTime')
    if (!Array.isArray(tracks) || !tracks.length) throw new Error('Nothing to scrobble')

    const trackIds = tracks.map((track) => track.id)

    const body = {
      albumScrobble: {
        discogsId,
        startTime,
        tracks: trackIds
      },
      timezoneOffsetSeconds: moment().utcOffset() * 60,
    }

    return axios({
      method: 'POST',
      url: this.urls.scrobble,
      data: body,
      headers: {
        'last_fm_session_key': localStorage.getItem('lastFmSession')
      }
    })
  },

  enableHeosScrobbling: function(heosScrobblingEnabled) {
    return axios({
      method: 'POST',
      url: this.urls.enableHeosScrobbling,
      data: {
        enableHeosScrobbling: heosScrobblingEnabled
      },
      headers: {
        'last_fm_session_key': localStorage.getItem('lastFmSession')
      }
    })
  }
}
