'use strict';
const express = require('express'),
  explain = require('../explain_query'),
  log = require('../logger'),
  router = express.Router();

module.exports = () => {
  router.get('/', (req, res) => {
    if (!req.queryText) {
      res.status(422).json({
        message: 'Request failed',
        errors: [{
          resource: 'Query',
          field: 'queryText',
          code: 'missing'
        }]
      });
      return;
    }
    log.info('Received query:\n%s', req.query.queryText);
    const explainedQuery = explain(req.query.queryText);

    req.db
      .find(explainedQuery)
      .then(result => {
        res.json(result);
      })
      .catch(e => {
        res.json(e.message);
      });
  });
  return router;
};
