var Promise = require('bluebird'),
    _ = require('lodash')

var findByTagName = require('../findBy/tagname')
var findByExample = require('../findBy/example')
var findByListingInfo = require('../findBy/listingInfo')

function DB() {}

DB.prototype.init = function() {
    this.env = {}
    var self = this
    return Promise.join(
        findByTagName.init(this.env),
        findByExample.init(this.env),
        findByListingInfo.init(this.env)
    ).then(function() {
        return self
    })
}

function _apply_projection(env, results, projection) {

    // e.g.,
    // projection = {id: true, packageName: true}

    return results.map(function(id) {
        var app = env.apps.get(id, projection)
        return app
    })
}

DB.prototype.find = function(q, options) {

    var options = {
        limit: 5,
        scope: _.range(0, 100)
    }

    var env = this.env

    return findByListingInfo.find(env, q.listing, options)
        .then(function(results) {

            options.scope = results
            return findByTagName.find(env, q.ui, options)
        })
        .then(function(results) {

            options.scope = results
            return findByExample.find(env, q.ui, options)
        })
        .then(function(results) {

            return _apply_projection(env, results, options.projection)
        })
}

module.exports = DB