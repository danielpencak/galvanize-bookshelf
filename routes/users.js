/* eslint-disable camelcase*/
/* eslint-disable object-shorthand*/
'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/users', (req, res, next) => {
  if (!req.body.email || !req.body.email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }
  bcrypt.hash(req.body.password, 12)
  .then((hashed_password) => {
    return knex('users').insert({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      hashed_password: hashed_password
    }, '*');
  })
  .then((users) => {
    const user = users[0];

    delete user.hashed_password;

    res.send(camelizeKeys(user));
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
