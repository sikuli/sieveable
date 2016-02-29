/* eslint no-param-reassign: 0 */
const Promise = require('bluebird'),
  express = require('express'),
  bodyParser = require('body-parser'),
  qRouter = require('./q'),
  DB = require('../db/index.js'),
  app = express();

// use jade as the view engine
app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

function db() {
  'use strict';
  let savedResult;
  return (req, res, next) => {
    if (savedResult) {
      req.db = savedResult.db;
      next();
    }
    else {
      Promise.props({ db: DB.open() })
        .then(result => {
          savedResult = result;
          req.db = result.db;
          next();
        });
    }
  };
}

app.use(db());
app.use('/q', qRouter());

module.exports = app;
