var express = require('express');
var explain = require('../explain_query');
var _ = require('lodash');
var log = require("../logger");
var router = express.Router()

module.exports = function () {

    router.get('/json', function (req, res) {

        log.info('Received query:\n%s', req.query.queryText);
        var explainedQuery = explain(req.query.queryText);

        req.db
            .find(explainedQuery)
            .then(function (result) {
                res.json(result)
            })
            .catch(function (e) {
                res.json(e.message);
            })
    })

    return router
}