class LastFMSession {
  async handle({ request }, next) {
    if (request.header('last_fm_session_key')) await next();
    else throw new Error('Last FM session key missing from request headers');
  }
}

module.exports = LastFMSession;
