var express = require('express'),
    explain = require('../explain_query'),
    _ = require('lodash');

var router = express.Router()

module.exports = function () {

    router.get('/json', function (req, res) {

        console.log('Received query:\n', req.query.queryText);
        var explainedQuery = explain(req.query.queryText);

        var query = {
            match: explainedQuery.match,
            listing: explainedQuery.listing,
            ui: explainedQuery.ui,
            manifest: explainedQuery.manifest,
            code: explainedQuery.code,
            return: explainedQuery.return,
            limit: explainedQuery.limit
        };

        var q = _.pick(query, _.identity);

        req.db
            .find(q)
            .then(function (result) {
                res.json(result)
            })
    })

    return router
}