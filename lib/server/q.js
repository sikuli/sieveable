const express = require('express'),
  explain = require('../explain_query'),
  log = require('../logger'),
  router = express.Router();

module.exports = () => {
  router.get('/', (req, res) => {
    if (!req.query.queryText) {
      res.status(422).json({
        message: 'Request failed',
        errors: [{
          resource: 'Query',
          field: 'queryText',
          reason: 'Missing required field.'
        }]
      });
      return;
    }
    log.info('ReceivedQuery',
      { ip: req.ip,
        query: req.query.queryText,
        cursor: req.query.cursor
      });
    const explainedQuery = explain(req.query.queryText),
      cursor = req.query.cursor ? req.query.cursor : '*';
    req.db
      .find(explainedQuery, cursor)
      .then(result => {
        res.json(result);
      })
      .catch((e) => {
        res.status(400).json({
          message: 'Query failed',
          errors: [{
            resource: 'Query',
            field: 'queryText',
            details: e.message
          }]
        });
      });
  });
  return router;
};
