const DiscogsService = require('../../Services/DiscogsService');

class DiscogsController {
  async getReleaseById({ params, response }) {
    await DiscogsService.getReleaseById({ discogsId: params.id })
      .then((data) => {
        response.status(200)
          .json(data);
      });
  }
}

module.exports = DiscogsController;
