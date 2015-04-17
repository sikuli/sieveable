var express = require('express'),
    explain = require('../explain_query'),
    _ = require('lodash');

var router = express.Router()

module.exports = function () {

    router.get('/json', function (req, res) {

        console.log('Received query:\n', req.query.queryText);
        //var explainedQuery = explain(req.query.queryText);
        //console.log(explainedQuery)
        //var query = {
        //    match: explainedQuery.match,
        //    listing: explainedQuery.listing,
        //    ui: explainedQuery.ui,
        //    manifest: explainedQuery.manifest,
        //    code: explainedQuery.code,
        //    perm: explainedQuery.perm,
        //    return: explainedQuery.return,
        //    limit: explainedQuery.limit
        //};

        //var q = _.pick(query, _.identity);

        var q = {perm: req.query.queryText}

        req.db
            .find(q)
            .then(function (result) {
                res.json(result)
            })
    })

    return router
}