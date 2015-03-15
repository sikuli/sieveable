var express = require('express')
var app = express()

var _ = require('lodash')

var bodyParser = require('body-parser')
var app = express()

// use jade as the view engine
app.set('view engine', 'jade')

// app.use(express.static(__dirname + '/public'))
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/q', require('./q')())
app.use('/ui', require('./ui')())
app.use('/view', require('./view')())

module.exports = app