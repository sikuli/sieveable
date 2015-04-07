var Promise = require('bluebird'),
    express = require('express'),
    _ = require('lodash'),
    bodyParser = require('body-parser'),
    DB = require('../db/index.js');

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

app.use(db())

app.use('/q', require('./q')())
app.use('/ui', require('./ui')())
app.use('/view', require('./view')())

module.exports = app