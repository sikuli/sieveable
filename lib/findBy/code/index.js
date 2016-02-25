const config = require('config'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request')),
  parse = require('../../parse'),
  apps = require('../../db/apps'),
  log = require('../../logger');

exports.init = function init(env) {
  return apps
    .init('code')
    .then((ret) => {
      const newEnv = env;
      newEnv.ids.code = ret;
      return newEnv;
    });
};

function getSmaliQuery(query) {
  let queryObj = parse(query);
  const lines = [];
  if (queryObj instanceof Array === false) {
    queryObj = [queryObj];
  }
  _.forEach(queryObj, (v) => {
    let line = '';
    _.forEach(v.attributes, (attrib) => {
      if (attrib.name.toLowerCase() === 'class') {
        line += `L${attrib.value.replace(/\./g, '/')}`;
      }
      else if (attrib.name.toLowerCase() === 'method') {
        line += `;->${attrib.value}`;
      }
    });
    if (line !== '') {
      lines.push(line);
    }
  });
  return lines;
}

exports.find = function find(env, query, options) {
  // If query is not specified, return everything in scope
  if (!query) {
    return Promise.resolve(options.scope);
  }
  const codeQueries = getSmaliQuery(query),
    solrConfig = config.get('dbConfig.solr'),
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${solrConfig.codeCollection}/query`,
    terms = _.map(codeQueries, (codeQuery) => {
      const escapedQuery = _escapeSpecialCharacters(codeQuery);
      return `"${escapedQuery}"`;
    }),
    _text_ = terms.join(' && '),
    scope = options.scope.join(' OR '),
    reqObj = {
      url: reqURL,
      qs: {
        q: `_text_: ${_text_} AND (id: ${scope} )`,
        wt: 'json',
        rows: config.get('dbConfig.solr.maxRows'),
        fl: 'id'
      }
    };
  // search the code collection in Solr
  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }
  return request.getAsync(reqObj)
    .get(1)
    .then((body) => {
      const docs = JSON.parse(body).response.docs,
        solrResults = _.pluck(docs, 'id');
      return Promise.resolve(solrResults);
    })
    .catch(clientError, (e) => {
      log.error('Solr client error has occurred when submitting code query %o',
        query, e);
      return Promise.reject(e);
    })
    .catch((e) => {
      log.error('Error in find by code when submitting code query %o', query, e);
      return Promise.reject(e);
    });
};

/**
 * Escape a string that uses any of Solr's special characters.
 * + - && || ! ( ) { } [ ] ^ " ~ * ? : /
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with a single backslash proceeding the
 * special character.
 * @private
 */
function _escapeSpecialCharacters(str) {
  let escaped = str.replace(/([\+\-!\(\)\{}\[\]\^"~\*\?:\/])/g, '\\$1');
  escaped = escaped.replace('&&', '\\&&');
  escaped = escaped.replace('||', '\\||');
  return escaped;
}
