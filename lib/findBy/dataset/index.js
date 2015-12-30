'use strict';
const Promise = require('bluebird'),
    redis = require('redis'),
    config = require('config'),
    log = require('../../logger'),
    redisClient = redis.createClient();

function getDatasetKeys(query) {
    const datasetKeys = [];
    if (query.code) {
        datasetKeys.push(config.get('dataset.codeKeyName'));
    }
    if (query.listing) {
        datasetKeys.push(config.get('dataset.listingKeyName'));
    }
    if (query.manifest) {
        datasetKeys.push(config.get('dataset.manifestKeyName'));
    }
    if (query.ui) {
        datasetKeys.push(config.get('dataset.uiKeyName'));
    }
    return datasetKeys;
}

exports.init = function init(env) {
    return Promise.resolve(env);
};

/*
* @return [ids] Returns the ids of apps resulting from the intersection of all the
* sets that are related to the given query parts.
*/
exports.find = function find(env, query) {
    const redisSInter = Promise.promisify(redisClient.sinter, redisClient),
        keys = getDatasetKeys(query);
    return redisSInter(keys)
        .then((intersection) => {
            return Promise.resolve(intersection);
        }).catch((e) => {
            log.error(e);
            return Promise.reject(e);
        });
};
