var Promise = require('bluebird');
var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var qRouter = require('./q');
var uiRouter = require('./ui');
var DB = require('../db/index.js');

var app = express()

// use jade as the view engine
app.set('view engine', 'jade')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))


function db() {

    var savedResult;

    return function (req, res, next) {

        if (savedResult) {
            req.db = savedResult.db
            next()

        } else {
            Promise.props({
                db: DB.open()
            }).then(function (result) {
                savedResult = result
                req.db = result.db
                next()
            })
        }
    }
}

app.use(db());

app.use('/', uiRouter());
app.use('/q', qRouter());

module.exports = app