/* eslint-disable no-unused-vars*/
/* eslint-disable max-len*/
'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const { camelizeKeys } = require('humps');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/token', (req, res) => {
  // Accept jot an verify that it is authentic (correct server) and integral (same header, payload)
  // Will run whenever user accesses different parts of an app - once initial token and cookie have been create in post below
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, _payload) => {
    if (err) {
      return res.send(false);
    }

    res.send(true);
  });
});

router.post('/token', (req, res, next) => {
  let user;

  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || !password.trim()) {
    return next(boom.create(400, 'Password must not be blank'));
  }

  // Check to see if there is a user with this email
  knex('users')
    .where('email', email)
    .first()
    .then((row) => {
      if (!row) {
        // Be purposefully vague
        throw boom.create(400, 'Bad email or password');
      }

      // Camelize to send to client in camel case
      user = camelizeKeys(row);

      // Returns promise (used on next then handler - doesn't need to be nested) - bcrypt validation method - password from user which is hashed and the hashed password from db - plain text password, work factor, and salt
      return bcrypt.compare(password, user.hashedPassword);
    })
    .then((/* Would include what the promise returns */) => {
      const claim = { userId: user.id };
      const token = jwt.sign(claim, process.env.JWT_KEY, {
        expiresIn: '7days' /* Adds exp field to payload */
      });

      // To send back to client - use cookie - in res header
      res.cookie('token', token, {
        httpOnly: true, /* Keeps cookie out of JavaScript code - document.cookies in browser console */
        // Expires as soon as the window or tab is closed
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        secure: router.get('env') === 'production' /* If true (if in production environment) will only run with HTTPS - set from NODE_ENV*/
      });

      delete user.hashedPassword;

      // Set response body which is separate from the cookie (res header)
      res.send(user);
    })

    // Guard catch
    .catch(bcrypt.MISMATCH_ERROR, () => {
      throw boom.create(400, 'Bad email or password');
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/token', (req, res) => {
  // Clear token cookie
  res.clearCookie('token');
  res.send({ success: true });
});

module.exports = router;
