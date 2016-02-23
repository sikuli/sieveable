'use strict';
const log = require('../logger'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  config = require('config'),
  request = Promise.promisifyAll(require('request'));

module.exports = function filter(env, packageName, query, options) {
  try {
    return Promise.resolve(getIdsByPackageName(packageName, query, options.scope));
  }
  catch (e) {
    log.error('Failed to apply filter by latest.', e);
    return Promise.reject(e);
  }
};

function getIdsByPackageName(packageName, query) {
  const solrConfig = config.get('dbConfig.solr'),
    collections = [];
  if (query.listing) {
    collections.push(solrConfig.listingCollection);
  }
  if (query.ui) {
    collections.push(solrConfig.uiTagCollection);
  }
  if (query.manifest) {
    collections.push(solrConfig.manifestCollection);
  }
  if (query.code) {
    collections.push(solrConfig.codeCollection);
  }
  return querySolr(packageName, collections)
    .then((idArray) => {
      return _.flattenDeep(idArray);
    });
}

function querySolr(packageName, collections) {
  const solrConfig = config.get('dbConfig.solr'),
    reqURLs = _.map(collections, (collection) => {
      return `http://${solrConfig.host}:${solrConfig.port}/solr/${collection}/query`;
    });
  return Promise.all(_.map(reqURLs, (reqURL) => {
    const reqObj = {
      url: reqURL,
      qs: {
        q: `package_name:${packageName}`,
        wt: 'json',
        rows: config.get('dbConfig.solr.maxRows'),
        fl: 'id'
      }
    };
    return sendSolrRequest(reqObj);
  }));
}

function sendSolrRequest(reqObj) {
  return request.getAsync(reqObj)
    .get(1)
    .then((body) => {
      const docs = JSON.parse(body).response.docs;
      return Promise.resolve(_.pluck(docs, 'id'));
    });
}
