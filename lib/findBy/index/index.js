'use strict';
const _ = require('lodash'),
  log = require('../../logger'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request').get, { multiArgs: true }),
  tagParser = require('../../parser/tag-parser'),
  suffixParser = require('../../parser/suffix-parser'),
  config = require('config');

exports.find = function find(env, query, queryType, options) {
  // If query is not specified, return everything in scope
  if (!query) {
    return Promise.resolve(options.scope);
  }
  if (queryType === 'ui') {
    return findByUIIndex(query, options.scope);
  }
  else if (queryType === 'manifest') {
    return findByManifestIndex(query, options.scope);
  }
  return Promise.reject(new Error('Unknown index type'));
};

function getSolrRequest(collectionName, arrValues, appIds) {
  const solrConfig = config.get('dbConfig.solr'),
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${solrConfig[collectionName]}/query`,
    terms = _.map(arrValues, (val) => {
      if (val.indexOf('*') > -1 && val.indexOf('*$') === -1 &&
          val.indexOf('$*') === -1) {
        return _escapeSpecialCharacters(val);
      }
      return `"${_escapeSpecialCharacters(val)}"`;
    }),
    _text_ = terms.join(' && '),
    scope = appIds.join(' OR '),
    reqObj = {
      url: reqURL,
      qs: {
        q: `_text_: ${_text_} AND id:( ${scope} )`,
        wt: 'json',
        rows: config.get('dbConfig.solr.maxRows'),
        fl: 'id'
      }
    };
  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }
  return request(reqObj)
    .get(1)
    .then((resBody) => {
      const body = JSON.parse(resBody);
      if (body.response) {
        const docs = body.response.docs;
        return Promise.resolve(_.map(docs, 'id'));
      }
      return Promise.resolve([]);
    })
    .catch(clientError, (e) => {
      log.error(e);
      return Promise.reject(e);
    });
}

function findByUIIndex(query, scope) {
  const tagNames = tagParser.getTagNames(query),
    suffixNames = suffixParser.getSuffixNames(query);
  if (suffixNames.length > 0 && tagNames.length > 0) {
    return Promise.all([getSolrRequest('uiTagCollection', tagNames, scope),
              getSolrRequest('uiSuffixCollection', suffixNames, scope)])
      .then((ids) => {
        const inter = _.intersection(ids[0], ids[1]);
        return Promise.resolve(inter);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index results from the' +
          ` uiTagCollection and uiSuffixCollection. Reason: ${e.message}`));
      });
  }
  else if (suffixNames.length > 0 && tagNames.length === 0) {
    return getSolrRequest('uiSuffixCollection', suffixNames, scope)
      .then((ids) => {
        return Promise.resolve(ids);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index ' +
          `results from the uiSuffixCollection. Reason: ${e.message}`));
      });
  }
  else if (tagNames.length > 0 && suffixNames.length === 0) {
    return getSolrRequest('uiTagCollection', tagNames, scope)
      .then((ids) => {
        return Promise.resolve(ids);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index ' +
          `results from the uiTagCollection Reason: ${e.message}`));
      });
  }
  return Promise.reject(new Error('IndexSearchError: No tags are ' +
      'found for the given query'));
}

function findByManifestIndex(query, scope) {
  const tagNames = tagParser.getTagNames(query),
    suffixNames = suffixParser.getSuffixNames(query);
  if (tagNames.length === 0 && suffixNames.length > 0) {
    _.forEach(suffixNames, (item) => {
      tagNames.push(item);
    });
  }
  return getSolrRequest('manifestCollection', tagNames, scope)
    .then((ids) => {
      return Promise.resolve(ids);
    })
    .catch((e) => {
      return Promise.reject(new Error('Failed to get index ' +
        `results from the manifestCollection. Reason: ${e.message}`));
    });
}

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
