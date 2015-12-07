'use strict';
const Promise = require('bluebird'),
    _ = require('lodash'),
    findByIndex = require('../findBy/index'),
    findByUI = require('../findBy/ui'),
    findByManifest = require('../findBy/manifest'),
    findByListing = require('../findBy/listing'),
    returnWithListing = require('../returnWith/listing'),
    findByCode = require('../findBy/code'),
    findByDataset = require('../findBy/dataset'),
    mongoClient = require('../db/mongo-client.js'),
    log = require('../logger');


function DB() {
}

DB.prototype.init = function initDB() {
    this.env = {};
    const self = this;
    return Promise.all(
        [
            findByUI.init(this.env),
            findByListing.init(this.env),
            findByManifest.init(this.env),
            findByCode.init(this.env)
        ])
        .then(() => {
            return mongoClient;
        })
        .then((mongo) => {
            self.mongo = mongo;
            return self;
        })
        .error((e) => {
            log.error('Failed to initialize the database. Reason: %s', e.message);
        });
};

function applyProjection(env, results, options, projection, returnFields) {
    return results.map((item) => {
        return env.apps.project(item, options, projection, returnFields);
    });
}

function filterIds(ids, options, propertyName) {
    if (options[propertyName]) {
        const idsToFilter = _.pluck(options[propertyName], 'id');
        if (!_.isEmpty(idsToFilter)) {
            options[propertyName] = _.filter(options[propertyName], (obj) => {
                return _.indexOf(ids, obj.id) > -1;
            });
        }
    }
    return options;
}

DB.prototype.find = function doFind(query) {
    const mongo = this.mongo,
        env = this.env;
    if (query === undefined) {
        return Promise.reject(new Error('Error: Invalid Search query. Please ' +
            'make sure that the required keywords are spelled correctly ' +
            'or use a different search query.'));
    }
    const options = {
            limit: query.limit,
            mode: query.mode,
            scope: undefined
        },
        projection = { app: true, listing: false, ui: false, manifest: false };

    return findByDataset.find(env)
        .then((results) => {
            options.scope = results;
            if (query.listing) {
                projection.listing = true;
                return findByListing.find(env, query.listing, mongo, options);
            }
            return results;
        })
        .then((results) => {
            options.scope = results;
            return findByCode.find(env, query.code, options);
        })
        .then((results) => {
            options.scope = results;
            return findByIndex.find(env, query.ui, 'ui', options);
        })
        .then((results) => {
            options.scope = results;
            if (_.isEmpty(query.ui)) {
                return options.scope;
            }
            const uiPromise = findByUI.find(env, query.ui, options);
            if (uiPromise.isFulfilled()) {
                projection.ui = true;
                const uiResults = uiPromise.value();
                options.uiResult = uiResults;
                return _.pluck(uiResults, 'id');
            } else if (uiPromise.isRejected()) {
                throw new Error('UI Search failed. Reason: '
                    + uiPromise.reason());
            }
        })
        .then((results) => {
            options.scope = results;
            return findByIndex.find(env, query.manifest, 'manifest', options);
        })
        .then((results) => {
            options.scope = results;
            if (_.isEmpty(query.manifest)) {
                return options.scope;
            }
            const mPromise = findByManifest.find(env, query.manifest, options);
            if (mPromise.isFulfilled()) {
                projection.manifest = true;
                const mResults = mPromise.value();
                options.manifestResult = mResults;
                return _.pluck(mResults, 'id');
            } else if (mPromise.isRejected()) {
                throw new Error('Manifest search failed. Reason: ' + mPromise.reason());
            }
        })
        .then((results) => {
            options.scope = results;
            if (projection.listing) {
                return returnWithListing(env, query.listing, mongo, options)
                    .then((listingResult) => {
                        options.listingResult = listingResult;
                        return results;
                    });
            }
            return results;
        })
        .then((results) => {
            let allOptions = filterIds(results, options, 'uiResult');
            allOptions = filterIds(results, allOptions, 'manifestResult');
            return applyProjection(env, results, allOptions, projection,
                query.return);
        })
        .catch((e) => {
            log.error('Failed to perform search query: %s . Reason: %s',
                JSON.stringify(query), e.message);
            return Promise.reject(new Error('Error: failed to perform the given search query.'));
        });
};

module.exports = DB;
