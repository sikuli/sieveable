const config = require('config'),
  _ = require('lodash'),
  codeQueryParser = require('./code-query-parser'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request').get, { multiArgs: true }),
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

exports.find = function find(query, options, cursor) {
  // If query is not specified, return everything in scope
  if (!query) {
    return Promise.resolve(options.scope);
  }
  const solrConfig = config.get('dbConfig.solr'),
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${solrConfig.codeCollection}/query`,
    text = codeQueryParser.getSmaliQueryLine(query),
    scope = options.scope ? options.scope.join(' OR ') : undefined,
    q = scope ? `_text_: ${text} AND id:( ${scope} )` : `_text_: ${text}`,
    reqObj = {
      url: reqURL,
      qs: {
        q,
        rows: config.get('dbConfig.solr.maxRows'),
        fl: 'id',
        wt: 'json'
      }
    };
  if (cursor) {
    reqObj.qs.sort = 'id asc';
    reqObj.qs.cursorMark = cursor;
  }
  // search the code collection in Solr
  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }
  return request(reqObj)
    .get(1)
    .then((body) => {
      const respBody = JSON.parse(body),
        docs = respBody.response.docs,
        ids = _.map(docs, 'id'),
        solrResults = cursor ? { ids, cursor: respBody.nextCursorMark } : ids;
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
