const axios = require('axios');
const md5 = require('md5');
const qs = require('qs');
const moment = require('moment');

const Env = use('Env');

class LastFMService {
  static _key() {
    return Env.get('LAST_FM_KEY');
  }

  static _secret() {
    return Env.get('LAST_FM_SECRET');
  }

  static _callbackUrl() {
    return Env.get('LAST_FM_CALLBACK_URL');
  }

  static _urls() {
    return {
      authenticate: `https://www.last.fm/api/auth/?api_key=${LastFMService._key()}&cb=${LastFMService._callbackUrl()}`,
      base: 'https://ws.audioscrobbler.com/2.0/',
    };
  }

  static _generateSignature({ data }) {
    let signature = '';

    Object.keys(data)
      .sort()
      .forEach((field) => {
        signature += `${field}${data[field]}`;
      });
    signature += LastFMService._secret();

    return md5(signature);
  }

  static _calculateAlbumScrobbleTimestamps({ startTime, tracks }) {
    const scrobbleTime = moment(startTime);
    tracks.forEach((track) => {
      if (track.duration) scrobbleTime.second(scrobbleTime.second() + track.duration);
      track.scrobbleTime = moment(scrobbleTime);
    });
    return scrobbleTime;
  }

  static _constructAlbumScrobbles({ startTime, timezoneOffsetSeconds, album }) {
    const sortedTracks = album.tracks.filter(track => track.index !== null || track.index !== undefined)
      .sort((a, b) => a.index - b.index);

    const lastScrobbleTime = LastFMService._calculateAlbumScrobbleTimestamps({ startTime, tracks: sortedTracks });

    const artists = [];
    const albums = [];
    const tracks = [];
    const timestamps = [];

    sortedTracks.forEach((track) => {
      artists.push(album.artist);
      albums.push(album.title);
      tracks.push(track.title);
      timestamps.push(track.scrobbleTime.unix() - parseInt(timezoneOffsetSeconds, 10));
    });

    return {
      artists,
      albums,
      tracks,
      timestamps,
      lastScrobbleTime,
    };
  }

  static async _scrobbleMultiple({ sessionKey, artists, albums, tracks, timestamps, lastScrobbleTime }) { // eslint-disable-line object-curly-newline
    // Only 50 srobbles per occasion allowed by Last.fm
    if (tracks.length > 50) throw new Error('Only 50 scrobbles per occasion are allowed');

    const body = {
      api_key: LastFMService._key(),
      sk: sessionKey,
      method: 'track.scrobble',
    };

    tracks.forEach((track, index) => {
      body[`album[${index}]`] = albums[index];
      body[`artist[${index}]`] = artists[index];
      body[`timestamp[${index}]`] = timestamps[index];
      body[`track[${index}]`] = track;
    });

    body.api_sig = LastFMService._generateSignature({ data: body });
    body.format = 'json';

    const response = await axios({
      method: 'POST',
      url: LastFMService._urls().base,
      data: qs.stringify(body),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      status: response.status,
      data: {
        ...response.data,
        startTime: lastScrobbleTime ? lastScrobbleTime.format('YYYY-MM-DDTHH:mm') : null,
      },
    };
  }

  static async authenticate({ token }) {
    let data = {
      api_key: LastFMService._key(),
      method: 'auth.getsession',
      token,
    };

    data.api_sig = LastFMService._generateSignature({ data });
    data.format = 'json';
    data = qs.stringify(data);

    const response = await axios.get(`${LastFMService._urls().base}?${data}`);
    return response.data;
  }

  static async scrobbleAlbum({ sessionKey, startTime, timezoneOffsetSeconds, album }) {
    const scrobbles = LastFMService._constructAlbumScrobbles({ startTime, timezoneOffsetSeconds, album });

    return LastFMService._scrobbleMultiple({
      sessionKey,
      artists: scrobbles.artists,
      albums: scrobbles.albums,
      tracks: scrobbles.tracks,
      timestamps: scrobbles.timestamps,
      lastScrobbleTime: scrobbles.lastScrobbleTime,
    });
  }

  static async scrobbleTrack({ sessionKey, scrobbleTime, timezoneOffsetSeconds, track }) {
    return LastFMService._scrobbleMultiple({
      sessionKey,
      artists: [track.artist],
      albums: [track.album],
      tracks: [track.title],
      timestamps: [moment(scrobbleTime).unix() - timezoneOffsetSeconds]
    });
  }
}

module.exports = LastFMService;
