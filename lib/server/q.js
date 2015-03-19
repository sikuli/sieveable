var express = require('express')
var router = express.Router()

var parse = require('../parse')

module.exports = function() {

    router.get('/json', function(req, res) {

        console.log('received query:', req.query)
        var query_xml = req.query.q             
        var q = parse(query_xml)

        q = {
            ui: q
        }

        req.db
            .find(q)
            .then(function(result) {
                res.json(result)
            })
    })

    return router
}