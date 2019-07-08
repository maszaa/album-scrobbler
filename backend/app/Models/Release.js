const Model = use('Model');

class Release extends Model {
  tracks() {
    return this.hasMany('App/Models/Track');
  }
}

module.exports = Release;
