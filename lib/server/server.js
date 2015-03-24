var express = require('express')

var _ = require('lodash')

var bodyParser = require('body-parser')
var app = express()

// use jade as the view engine
app.set('view engine', 'jade')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))

var DB = require('../db/index.js')

function db() {

    var dbInstance

    return function (req, res, next) {

        if (dbInstance) {
            req.db = dbInstance
            next()

        } else {

            DB.open()
                .then(function (ret) {
                    console.log('db', ret)
                    dbInstance = ret
                    req.db = dbInstance
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