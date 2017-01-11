/* eslint-disable no-extra-parens*/
'use strict';

module.exports.up = ((knex) => {
  return knex.schema.createTable('favorites', (table) => {
    table.increments();
    table.integer('book_id')
      .notNullable()
      .references('id')
      .inTable('books')
      .onDelete('CASCADE')
      .index();
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();
    table.timestamps(true, true);
  });
});

module.exports.down = ((knex) => {
  return knex.schema.dropTable('favorites');
});
