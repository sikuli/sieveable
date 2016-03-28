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
  config = require('config'),
  apps = require('./apps'),
  log = require('../logger');


function DB() {}

DB.prototype.init = function initDB() {
  this.env = {};
  this.env.apps = apps;
  return this;
};

function applyProjection(env, results, options, projection, returnFields) {
  const result = {
    apps: results.map((item) => {
      return env.apps.project(item, options, projection, returnFields);
    })
  };
  if (config.get('server.returnCursor')) {
    result.cursor = options.cursor;
  }
  return result;
}

function filterIds(ids, options, propertyName) {
  const newOptions = options;
  if (newOptions[propertyName]) {
    const idsToFilter = _.map(newOptions[propertyName], 'id');
    if (!_.isEmpty(idsToFilter)) {
      newOptions[propertyName] = _.filter(newOptions[propertyName], (obj) => {
        return _.indexOf(ids, obj.id) > -1;
      });
    }
  }
  return newOptions;
}

DB.prototype.find = function doFind(query, cursor) {
  if (query === undefined) {
    return Promise.reject(new Error('Error: Invalid Search query. Please ' +
      'make sure that the required keywords are spelled correctly ' +
      'or use a different search query.'));
  }
  const env = this.env,
    options = {
      limit: query.limit,
      mode: query.mode,
      scope: undefined,
      cursor
    },
    projection = {
      app: true,
      listing: false,
      ui: false,
      manifest: false
    };

  return findByDataset.find(query, cursor)
    .then((result) => {
      options.scope = result.ids;
      options.cursor = result.cursor;
      return filterBy(env, query, options);
    })
    .then((results) => {
      options.scope = results;
      if (query.listing) {
        projection.listing = true;
        return findByListing.find(query.listing, options);
      }
      return results;
    })
    .then((results) => {
      options.scope = results;
      return findByCode.find(query.code, options);
    })
    .then((results) => {
      options.scope = results;
      return findByIndex.find(query.ui, 'ui', options);
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
          return _.map(uiResults, 'id');
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
          return _.map(manifestResults, 'id');
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
      const allOptions = filterIds(results, options, 'uiResult'),
        finalOptions = filterIds(results, allOptions, 'manifestResult');
      return applyProjection(env, results, finalOptions, projection,
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
