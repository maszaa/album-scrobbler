const DiscogsService = require('../../Services/DiscogsService');
const LastFMService = require('../../Services/LastFMService');


class LastFMController {
  async getSession({ request, response }) {
    await LastFMService.authenticate({ token: request.get().token })
      .then((data) => {
        response.status(200)
          .json(data);
      })
      .catch((err) => {
        response.status(err.response.status)
          .json(err.response.data);
      });
  }

  async scrobble({ request, response }) {
    const data = request.post();
    let lastFmServiceResponse;

    if (data.singleScrobble) {
      lastFmServiceResponse = LastFMService.scrobbleTrack({
        sessionKey: request.header('last_fm_session_key'),
        scrobbleTime: data.singleScrobble.scrobbleTime,
        timezoneOffsetSeconds: data.timezoneOffsetSeconds,
        track: data.singleScrobble.track,
      });
    } else {
      const album = await DiscogsService.fetchReleaseFromDb({ discogsId: data.albumScrobble.discogsId, tracks: data.albumScrobble.tracks });

      lastFmServiceResponse = LastFMService.scrobbleAlbum({
        sessionKey: request.header('last_fm_session_key'),
        startTime: data.albumScrobble.startTime,
        timezoneOffsetSeconds: data.timezoneOffsetSeconds,
        album,
      })
    }

    await lastFmServiceResponse
      .then((lastFmResponse) => {
        response.status(lastFmResponse.status)
          .json(lastFmResponse.data);
      })
      .catch((err) => {
        response.status(err.response ? err.response.status : 500)
          .json(err.response ? err.response.data : { error: err.toString() });
      });
  }
}

module.exports = LastFMController;
