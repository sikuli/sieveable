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
  filterBy = require('../filterBy/index'),
  apps = require('./apps'),
  log = require('../logger');


function DB() {}

DB.prototype.init = function initDB() {
  this.env = {};
  this.env.apps = apps;
  this.env.ids = {};
  log.info('Initializing database with app ids...');
  return findByUI.init(this.env)
          .then((env) => {
            return findByListing.init(env);
          })
          .then((env) => {
            return findByManifest.init(env);
          })
          .then((env) => {
            return findByCode.init(env);
          })
          .then((env) => {
            log.info('The database has been intitalized with app ids.');
            this.env = env;
            return this;
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
  if (query === undefined) {
    return Promise.reject(new Error('Error: Invalid Search query. Please ' +
      'make sure that the required keywords are spelled correctly ' +
      'or use a different search query.'));
  }
  const env = this.env,
    options = {
      limit: query.limit,
      mode: query.mode,
      scope: undefined
    },
    projection = {
      app: true,
      listing: false,
      ui: false,
      manifest: false
    };

  return findByDataset.find(env, query)
    .then((results) => {
      options.scope = results;
      return filterBy(env, query, options);
    })
    .then((results) => {
      options.scope = results;
      if (query.listing) {
        projection.listing = true;
        return findByListing.find(env, query.listing, options);
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
      if (_.isEmpty(query.ui)) {
        return results;
      }
      options.scope = results;
      return findByUI.find(env, query.ui, options)
        .then((uiResults) => {
          projection.ui = true;
          options.uiResult = uiResults;
          return _.pluck(uiResults, 'id');
        });
    })
    .then((results) => {
      options.scope = results;
      return findByIndex.find(env, query.manifest, 'manifest', options);
    })
    .then((results) => {
      if (_.isEmpty(query.manifest)) {
        return results;
      }
      options.scope = results;
      return findByManifest.find(env, query.manifest, options)
        .then((manifestResults) => {
          projection.manifest = true;
          options.manifestResult = manifestResults;
          return _.pluck(manifestResults, 'id');
        });
    })
    .then((results) => {
      options.scope = results;
      if (projection.listing) {
        return returnWithListing(env, query.listing, options)
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
      return Promise.reject(new Error(
        'Error: failed to perform the given search query.'));
    });
};

module.exports = DB;
