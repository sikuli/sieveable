var express = require('express'),
    explain = require('../explain_query'),
    _ = require('lodash');

var router = express.Router()

module.exports = function () {

    router.get('/json', function (req, res) {

        console.log('Received query:\n%s', req.query.queryText);
        var explainedQuery = explain(req.query.queryText);
        console.log(explainedQuery)

        req.db
            .find(explainedQuery)
            .then(function (result) {
                res.json(result)
            })
    })

    return router
}