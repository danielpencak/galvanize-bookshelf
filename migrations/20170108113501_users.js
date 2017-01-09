/* eslint-disable no-extra-parens*/
'use strict';

module.exports.up = ((knex) => {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('first_name').notNullable().defaultTo('');
    table.string('last_name').notNullable().defaultTo('');
    table.string('email').unique().notNullable();
    table.specificType('hashed_password', 'char(60)').notNullable();
    table.timestamps(true, true);
  });
});

module.exports.down = ((knex) => {
  return knex.schema.dropTable('users');
});
