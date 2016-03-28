const _ = require('lodash'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request').get, { multiArgs: true }),
  log = require('../../logger'),
  config = require('config');

exports.get = function get(collectionName, queryText, cursor) {
  const solrConfig = config.get('dbConfig.solr'),
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${collectionName}/query`,
    reqObj = {
      url: reqURL,
      qs: {
        q: `_text_: ${queryText}`,
        sort: 'id asc',
        rows: config.get('dbConfig.solr.maxRows'),
        cursorMark: cursor,
        fl: 'id',
        wt: 'json'
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
        return Promise.resolve({ ids: _.map(docs, 'id'),
                 cursor: body.nextCursorMark });
      }
      return Promise.resolve({ ids: [], cursor: undefined });
    })
    .catch(clientError, (e) => {
      log.error('FetchCursorError', e);
      return Promise.reject(e);
    });
};
