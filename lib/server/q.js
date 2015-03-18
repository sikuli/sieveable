var express = require('express')
var router = express.Router()

var parse = require('../parse'),
    db = require('../db')// console.log(index)

module.exports = function() {

    router.get('/json', function(req, res) {
                
        console.log('received query:', req.query)
        var query_xml = req.query.q

        var q = parse(query_xml)            
        db.find(q, function(err, result) {            
            res.json(result)
        })
    })

    return router
}