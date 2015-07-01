var Promise = require('bluebird');
var _ = require('lodash');
var findByIndex = require('../findBy/index');
var findByUI = require('../findBy/ui');
var findByManifest = require('../findBy/manifest');
var findByListing = require('../findBy/listing');
var findByCode = require('../findBy/code');
var findByDataset = require('../findBy/dataset');
var mongoClient = require('../db/mongo-client.js');
var log = require("../logger");


function DB() {
}

DB.prototype.init = function () {
    this.env = {}
    var self = this
    return Promise.all(
        [
            findByUI.init(this.env),
            findByListing.init(this.env),
            findByManifest.init(this.env),
            findByCode.init(this.env)
        ])
        .then(function () {
            return mongoClient
        })
        .then(function (mongo) {
            self.mongo = mongo
            return self
        })
        .error(function (e) {
            log.error('Failed to initialize the database. Reason: %s', e.message)
        })
}

function _apply_projection(env, results, projection) {

    // e.g.,
    // projection = {id: true, packageName: true}

    return results.map(function (item) {
        var app = env.apps.get(item, projection)
        return app
    })
}

DB.prototype.find = function (query) {

    var mongo = this.mongo
    var env = this.env
    if (!query) {
        return Promise.reject(new Error("Error: Invalid Search query. Please " +
            "make sure that the required keywords are spelled correctly " +
            "or use a different search query."));
    }
    var options = {
        limit: query.limit,
        mode: query.mode,
        scope: undefined
    }

    return findByDataset.find(env)
        .then(function (results) {
            options.scope = results
            return findByListing.find(env, query.listing, mongo, options)
        })
        .then(function (results) {
            options.scope = results
            return findByCode.find(env, query.code, options)
        })
        .then(function (results) {
            options.scope = results
            return findByIndex.find(env, query.ui, "ui", options);
        })
        .then(function (results) {
            options.scope = results
            return findByUI.find(env, query.ui, options)
        })
        .then(function (results) {
            options.scope = results
            return findByIndex.find(env, query.manifest, 'manifest', options)
        })
        .then(function (results) {
            options.scope = results
            return findByManifest.find(env, query.manifest, options)
        })
        .then(function (results) {
            return _apply_projection(env, results, options.projection)
        })
        .catch(function (e) {
            log.error('Failed to perform search query: %s . Reason: %s',
                JSON.stringify(query), e.message);
            return Promise.reject(new Error('Error: failed to perform the given search query.'));
        });
}

module.exports = DB