const Schema = use('Schema');

class TrackSchema extends Schema {
  up() {
    this.create('tracks', (table) => {
      table.increments();
      table.timestamps();
      table.integer('release_id')
        .notNullable();
      table.foreign('release_id')
        .references('releases.id');
      table.string('title')
        .notNullable();
      table.string('position');
      table.integer('index');
      table.integer('duration'); // Duration in seconds
    });
  }

  down() {
    this.drop('tracks');
  }
}

module.exports = TrackSchema;
