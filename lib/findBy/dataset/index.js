'use strict';
const Promise = require('bluebird'),
  log = require('../../logger'),
  config = require('config'),
  tagParser = require('../../parser/tag-parser.js'),
  findByCode = require('../code'),
  findByListing = require('../listing'),
  _ = require('lodash'),
  fetchCursor = require('./fetch-cursor');


/*
 * @return [ids] Returns the ids of apps resulting from the intersection of all the
 * sets that are related to the given query parts.
 */
exports.find = function find(env, query, cursor) {
  'use strict';
  return findByDataset(env, query, cursor)
  .then((result) => {
    return result;
  })
  .catch((e) => {
    log.error('Unable to get dataset ids for the given query ', query);
    return Promise.reject(new Error('Unable to get dataset ids for the given query.' +
      ` Reason: ${e.message}`));
  });
};

/*
* Returns a set of app ids and a cursor (pointer) to the result set.
* Clients can iterate through the returned cursor to retrieve large results.
* The cursor always belongs to a single Solr collection depending on the query
* parts of the given query and using the following order:
* - uiTag collection - if the query contains a UI part.
* - manifest - if the query contains a manifest part.
* - listing - if the query contains a listing part.
* - code - if the query contains a listing part.
*/
function findByDataset(query, cursor) {
  if (query.ui) {
    const tagNames = tagParser.getTagNames(query.ui);
    return fetchCursor.get(config.get('dbConfig.solr.uiTagCollection'),
                          getSearchTerms(tagNames), cursor);
  }
  else if (query.manifest) {
    const tagNames = tagParser.getTagNames(query.manifest);
    return fetchCursor.get(config.get('dbConfig.solr.manifestCollection'),
                          getSearchTerms(tagNames), cursor);
  }
  else if (query.listing) {
    return findByListing.find(query.listing, {}, cursor);
  }
  else if (query.code) {
    return findByCode.find(query.code, {}, cursor);
  }
  return Promise.reject(new Error('Unknown query level.'));
}

function getSearchTerms(tagNames) {
  const terms = _.map(tagNames, (val) => {
    if (val.indexOf('*') > -1 && val.indexOf('*$') === -1 && val.indexOf('$*') === -1) {
      return _escapeSpecialCharacters(val);
    }
    return `"${_escapeSpecialCharacters(val)}"`;
  });
  return terms.join(' && ');
}
// TODO: Remove let from the _escape function
console.log()
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
