var Promise = require('bluebird');
var _ = require('lodash');
var findByIndex = require('../findBy/index');
var findByUI = require('../findBy/ui');
var findByManifest = require('../findBy/manifest');
var findByListing = require('../findBy/listing');
var returnWithListing = require('../returnWith/listing');
var findByCode = require('../findBy/code');
var findByDataset = require('../findBy/dataset');
var mongoClient = require('../db/mongo-client.js');
var log = require("../logger");


function DB() {
}

DB.prototype.init = function () {
    this.env = {};
    var self = this;
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
            self.mongo = mongo;
            return self
        })
        .error(function (e) {
            log.error('Failed to initialize the database. Reason: %s', e.message)
        })
};

function _apply_projection(env, results, options, projection) {
    return results.map(function (item) {
        return env.apps.project(item, options, projection);
    });
}

function _filter_ids(ids, options, propertyName) {
    if (options[propertyName]) {
        var idsToFilter = _.pluck(options[propertyName], 'id');
        if (!_.isEmpty(idsToFilter)) {
            options[propertyName] = _.filter(options[propertyName],
                function (obj) {
                    return _.indexOf(ids, obj.id) > -1;
                });
        }
    }
    return options;
}

DB.prototype.find = function (query) {

    var mongo = this.mongo;
    var env = this.env;
    if (!query) {
        return Promise.reject(new Error("Error: Invalid Search query. Please " +
            "make sure that the required keywords are spelled correctly " +
            "or use a different search query."));
    }
    var options = {
        limit: query.limit,
        mode: query.mode,
        scope: undefined
    };
    var projection = {app: true, listing: false, ui: false, manifest: false};

    return findByDataset.find(env)
        .then(function (results) {
            options.scope = results;
            if (query.listing) {
                projection.listing = true;
                return findByListing.find(env, query.listing, mongo, options);
            }
            else {
                return results;
            }
        })
        .then(function (results) {
            options.scope = results;
            return findByCode.find(env, query.code, options);
        })
        .then(function (results) {
            options.scope = results;
            return findByIndex.find(env, query.ui, "ui", options);
        })
        .then(function (results) {
            options.scope = results;
            if (_.isEmpty(query.ui)) {
                return options.scope;
            }
            else {
                var uiPromise = findByUI.find(env, query.ui, options);
                if (uiPromise.isFulfilled()) {
                    projection.ui = true;
                    var uiResults = uiPromise.value();
                    options.uiResult = uiResults;
                    return _.pluck(uiResults, 'id');
                }
                else if (uiPromise.isRejected()) {
                    throw new Error("UI Search failed. Reason: " + uiPromise.reason());
                }
            }
        })
        .then(function (results) {
            options.scope = results;
            return findByIndex.find(env, query.manifest, 'manifest', options);
        })
        .then(function (results) {
            options.scope = results;
            if (_.isEmpty(query.manifest)) {
                return options.scope;
            }
            else {
                var mPromise = findByManifest.find(env, query.manifest, options);
                if (mPromise.isFulfilled()) {
                    projection.manifest = true;
                    var mResults = mPromise.value();
                    options.manifestResult = mResults;
                    return _.pluck(mResults, 'id');
                }
                else if (mPromise.isRejected()) {
                    throw new Error("Manifest search failed. Reason: " + mPromise.reason());
                }
            }
        })
        .then(function (results) {
            options.scope = results;
            if (projection.listing) {
                return returnWithListing(env, query.listing, mongo, options)
                    .then(function (listingResult) {
                        options.listingResult = listingResult;
                        return results;
                    })
            }
            else {
                return results;
            }
        })
        .then(function (results) {
            options = _filter_ids(results, options, 'uiResult');
            options = _filter_ids(results, options, 'manifestResult');
            return _apply_projection(env, results, options, projection);
        })
        .catch(function (e) {
            log.error('Failed to perform search query: %s . Reason: %s',
                JSON.stringify(query), e.message);
            return Promise.reject(new Error('Error: failed to perform the given search query.'));
        });
};

module.exports = DB;