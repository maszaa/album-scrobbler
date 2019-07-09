const DiscogsService = require('../../Services/DiscogsService');

class DiscogsController {
  async getReleaseById({ params, response }) {
    await DiscogsService.getReleaseById({ discogsId: params.id })
      .then((data) => {
        response.status(200)
          .json(data);
      })
      .catch((err) => {
        response.status(err.response ? err.response.status : 500)
          .json(err.response ? err.response.data : {error: err.toString()})
      });
  }
}

module.exports = DiscogsController;
