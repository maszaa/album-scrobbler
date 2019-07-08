const axios = require('axios');

const Env = use('Env');

const Release = use('App/Models/Release');
const Track = use('App/Models/Track');

class DiscogsService {
  static _authorizationHeader() {
    return `Discogs key=${Env.get('DISCOGS_KEY')}, secret=${Env.get('DISCOGS_SECRET')}`;
  }

  static _urls() {
    return {
      releaseById: 'https://api.discogs.com/releases/',
    };
  }

  static async _parseRelease({ data }) {
    const release = new Release();
    release.discogsId = data.id;
    release.artist = data.artists[0].name.split(/[ ([0-9]+[)]$/).shift();
    release.title = data.title;
    release.year = data.released;
    release.cover = data.images.length !== 0 ? data.images[0].uri150 : null;

    await release.save();

    await Promise.all(
      data.tracklist.map((track, index) => {
        const dbTrack = new Track();
        dbTrack.release_id = release.id;
        dbTrack.title = track.title;
        dbTrack.position = track.position;
        dbTrack.index = track.position || track.duration ? index : null;

        if (track.duration) {
          const timeParts = track.duration.split(':');
          const minutes = parseInt(timeParts.shift(), 10);
          const seconds = parseInt(timeParts.shift(), 10);

          dbTrack.duration = minutes * 60 + seconds;
        }

        return dbTrack.save();
      }),
    );
  }

  static async fetchReleaseFromDb({ discogsId, tracks = null }) {
    let release = await Release.query()
      .where('discogsId', discogsId)
      .with('tracks', (builder) => {
        if (tracks) builder.whereIn('id', tracks);
      })
      .fetch();

    release = release.toJSON();
    return release.length ? release[0] : null;
  }

  static async getReleaseById({ discogsId }) {
    const release = await DiscogsService.fetchReleaseFromDb({ discogsId });

    if (!release) {
      return axios.get(`${DiscogsService._urls().releaseById}${discogsId}`, {
        headers: {
          authorization: DiscogsService._authorizationHeader(),
        },
      })
        .then(response => DiscogsService._parseRelease({ data: response.data }))
        .then(() => DiscogsService.fetchReleaseFromDb({ discogsId }));
    }

    return release;
  }
}

module.exports = DiscogsService;
