var Promise = require('bluebird');
var _ = require('lodash');
var findByIndex = require('../findBy/index');
var findByUI = require('../findBy/ui');
var findByManifest = require('../findBy/manifest');
var findByListing = require('../findBy/listing');
var findByCode = require('../findBy/code');
var findByDataset = require('../findBy/dataset');
var mongoConnection = require('../db/connection');
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
            return mongoConnection
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
    var options = {
        limit: query.limit,
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
            return findByIndex.find(env, query.ui, "ui",  options);
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
            log.error(e)
        });
}

module.exports = DB