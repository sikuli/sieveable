var Promise = require('bluebird'),
    _ = require('lodash'),
    findByTagName = require('../findBy/tagname'),
    findByUI = require('../findBy/ui'),
    findByManifest = require('../findBy/manifest'),
    findByListing = require('../findBy/listing'),
    findByCode = require('../findBy/code'),
    findByPerm = require('../findBy/perm'),
    findByDataset = require('../findBy/dataset'),
    mongoConnection = require('../db/connection')


function DB() {
}

DB.prototype.init = function () {
    this.env = {}
    var self = this
    return Promise.join(
        findByTagName.init(this.env),
        findByUI.init(this.env),
        findByListing.init(this.env),
        findByManifest.init(this.env),
        findByCode.init(this.env),
        mongoConnection
    ).then(function (results) {
            self.mongo = results[5]
            return self
        })
        .error(function (e) {
            console.error('Failed to initialize the database. Reason: ' + e.message)
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
            return findByTagName.find(env, query.ui, options);
        })
        .then(function (results) {
            options.scope = results
            return findByUI.find(env, query.ui, options)
        })
        .then(function (results) {//TODO: Index manifest and move this below findByListing
            options.scope = results
            return findByManifest.find(env, query.manifest, options)
        })
        .then(function (results) {
            options.scope = results
            return findByPerm.find(env, query.perm, options)
        })
        .then(function (results) {
            return _apply_projection(env, results, options.projection)
        })
        .catch(function (e) {
            console.error(e)
        });
}

module.exports = DB