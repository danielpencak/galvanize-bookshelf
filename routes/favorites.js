/* eslint-disable camelcase*/
/* eslint-disable no-extra-parens*/
'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = ((req, res, next) => {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
});

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', req.claim.userId)
    .orderBy('books.title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check?', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', req.claim.userId)
    .where('favorites.book_id', req.query.bookId)
    .first()
    .then((row) => {
      if (row) {
        res.send(true);
      }
      else {
        res.send(false);
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  knex('books')
    .where('id', req.body.bookId)
    .first()
    .then((book) => {
      if (!book) {
        return next(boom.create(400, 'Book does not exist'));
      }

      return knex('favorites')
        .insert({
          book_id: req.body.bookId,
          user_id: req.claim.userId
        }, '*');
    })
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  let favorite;

  const { bookId } = req.body;

  knex('favorites')
    .where('favorites.book_id', bookId)
    .first()
    .then((row) => {
      if (!row) {
        return next();
      }

      favorite = row;

      return knex('favorites')
        .del()
        .where('favorites.book_id', bookId);
    })
    .then(() => {
      delete favorite.id;

      res.send(camelizeKeys(favorite));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
