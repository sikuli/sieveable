'use strict';
const config = require('config'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    redis = require('redis'),
    request = Promise.promisifyAll(require('request')),
    log = require('../logger');

function getSolrIds(collectionName) {
    const solrConfig = config.get('dbConfig.solr'),
        maxRows = solrConfig.maxRows,
        reqURL = 'http://' + solrConfig.host + ':' + solrConfig.port +
                 '/solr/' + collectionName + '/query',
        reqObj = {
            url: reqURL,
            qs: { q: 'id:*', wt: 'json', rows: maxRows, fl: 'id' }
        };

    function clientError(e) {
        return e.code >= 400 && e.code < 500;
    }

    return request.getAsync(reqObj)
        .get(1)
        .then((body) => {
            const docs = JSON.parse(body).response.docs;
            return Promise.resolve(_.pluck(docs, 'id'));
        })
        .catch(clientError, (e) => {
            log.error(e);
            return Promise.reject(e);
        });
}

exports.insertSolrKeys = function insertSolrKeys(key, solrCollection) {
    const redisClient = redis.createClient();
    redisClient.on('error', (err) => {
        log.error('Error ' + err);
        throw (err);
    });

    return new Promise((resolve, reject) => {
        getSolrIds(solrCollection)
            .then((ids) => {
                _.forEach(ids, (id) => {
                    log.info(key + ' => ' + id);
                    redisClient.SADD(key, id);
                });
                return key;
            })
            .then(() => {
                redisClient.quit();
                resolve();
            })
            .catch((e) => {
                redisClient.quit();
                reject(new Error('Error in indexRedis. ' + e.message));
            });
    });
};

// Insert the union of id values of all keys into one set that represents the
// entire unique apps in the dataset.
exports.insertDatasetKeys = function insertDatasetKeys(datasetKey, keys) {
    const redisPromise = Promise.promisifyAll(redis),
        redisClient = redisPromise.createClient();
    redisClient.on('error', (err) => {
        log.error('Error ' + err);
        throw (err);
    });
    return Promise.map(keys, (key) => {
        return redisClient.SMEMBERSAsync(key)
            .then((ids) => {
                const promises = [];
                _.forEach(ids, (id) => {
                    log.info(datasetKey + ' => ' + id);
                    promises.push(redisClient.sadd(datasetKey, id));
                });
                return Promise.all(promises).then(() => {
                    return Promise.resolve();
                }).catch((e) => {
                    log.error('Failed to add keys to %s. %s', key, e.message);
                    return Promise.reject(e);
                });
            });
    }, { concurrency: 1 }).then(() => {
        log.info('All dataset ids have been added to %s redis set.', datasetKey);
        redisClient.quit();
        return Promise.resolve();
    }).catch((e) => {
        log.error(e.message);
        return Promise.reject(e);
    });
};
