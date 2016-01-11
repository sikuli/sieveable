'use strict';
const Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request')),
  config = require('config'),
  _ = require('lodash'),
  log = require('../logger');

/**
 *
 * @param queryObj {Object} query parameter
 * @param fieldsToReturn {String} Comma separated list of fields to return in the response.
 * @return {Promise.<T>}
 */
exports.findListing = function querySolrRequest(queryObj, fieldsToReturn) {
  const solrConfig = config.get('dbConfig.solr'),
    reqURL = 'http://' + solrConfig.host + ':' + solrConfig.port +
    '/solr/' + solrConfig.listingCollection + '/query';
  const terms = _.map(queryObj, (value, key) => {
    if (key === 'rate' || key === 'dct') {
      return key + ':' + value;
    }
    if (value.indexOf('*') > -1 && value.indexOf('*$') === -1 &&
      value.indexOf('$*') === -1) {
      return key + ':' + _escapeSpecialCharacters(value);
    }
    return key + ':"' + _escapeSpecialCharacters(value) + '"';
  });
  const q = terms.join(' && '),
    reqObj = {
      url: reqURL,
      qs: {
        q, wt: 'json',
        rows: config.get('dbConfig.solr.maxRows'), fl: fieldsToReturn
      }
    };

  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }
  return request.getAsync(reqObj)
    .get(1)
    .then((body) => {
      return JSON.parse(body).response.docs;
    })
    .catch(clientError, (e) => {
      log.error(e);
      return Promise.reject(e);
    });
};

/**
 * Escape a string that uses any of Solr's special characters except the *.
 * + - && || ! ( ) { } [ ] ^ " ~ ? : /
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with a single backslash proceeding the
 * special character.
 * @private
 */
function _escapeSpecialCharacters(str) {
  let escaped = str.replace(/([\+\-!\(\)\{}\[\]\^"~\?:\/])/g, '\\$1');
  escaped = escaped.replace('&&', '\\&&');
  escaped = escaped.replace('||', '\\||');
  return escaped;
}
