const Schema = use('Schema');

class ReleaseSchema extends Schema {
  up() {
    this.create('releases', (table) => {
      table.increments();
      table.timestamps();
      table.integer('discogsId')
        .unique()
        .notNullable();
      table.string('artist')
        .notNullable();
      table.string('title');
      table.string('year');
      table.string('cover');
    });
  }

  down() {
    this.drop('releases');
  }
}

module.exports = ReleaseSchema;
