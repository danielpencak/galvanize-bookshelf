'use strict';

const boom = require('boom');
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const { camelizeKeys } = require('humps');

router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', (req, res, next) => {
  if (isNaN(parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  const bookAttributes = ['Title', 'Author', 'Genre', 'Description', 'Cover URL']; // eslint-disable-line max-len
  const requestAttributes = [req.body.title, req.body.author, req.body.genre, req.body.description, req.body.coverUrl]; // eslint-disable-line max-len

  for (let i = 0; i < bookAttributes.length; i++) {
    if (!requestAttributes[i] || (!requestAttributes[i].trim())) {
      throw boom.create(400, `${bookAttributes[i]} must not be blank`);
    }
  }
  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl // eslint-disable-line camelcase
    }, '*')
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  if (isNaN(parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }

      return knex('books')
        .update({
          title: req.body.title,
          author: req.body.author,
          genre: req.body.genre,
          description: req.body.description,
          cover_url: req.body.coverUrl // eslint-disable-line camelcase
        }, '*')
        .where('id', req.params.id);
    })
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  if (isNaN(parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .del()
    .returning('*')
    .where('id', req.params.id)
    .then((books) => {
      if (!books[0]) {
        throw boom.create(404, 'Not Found');
      }
      delete books[0].id;
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
