const config = require('config'),
  Promise = require('bluebird'),
  _ = require('lodash'),
  redis = require('redis'),
  request = Promise.promisifyAll(require('request')),
  log = require('../logger');

function getSolrIds(collectionName) {
  const solrConfig = config.get('dbConfig.solr'),
    maxRows = solrConfig.maxRows,
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${collectionName}/query`,
    reqObj = {
      url: reqURL,
      qs: {
        q: 'id:*',
        wt: 'json',
        rows: maxRows,
        fl: 'id'
      }
    };

  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }

  return request.getAsync(reqObj)
    .get(1)
    .then((body) => {
      const docs = JSON.parse(body)
        .response.docs;
      return Promise.resolve(_.map(docs, 'id'));
    })
    .catch(clientError, (e) => {
      log.error(e);
      return Promise.reject(e);
    });
}

exports.insertSolrKeys = function insertSolrKeys(key, solrCollection) {
  const redisClient = redis.createClient();
  redisClient.on('error', (err) => {
    log.error('Error ', err);
    throw (err);
  });

  return new Promise((resolve, reject) => {
    getSolrIds(solrCollection)
      .then((ids) => {
        _.forEach(ids, (id) => {
          log.info(`{key} => ${id}`);
          redisClient.sadd(key, id);
        });
        return key;
      })
      .then(() => {
        redisClient.quit();
        resolve();
      })
      .catch((e) => {
        redisClient.quit();
        reject(new Error(`Error in indexRedis. ${e.message}`));
      });
  });
};
