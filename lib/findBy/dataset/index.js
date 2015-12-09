'use strict';
const Promise = require('bluebird'),
    redis = Promise.promisifyAll(require('redis')),
    config = require('config'),
    log = require('../../logger'),
    redisClient = redis.createClient(),
    key = config.get('dataset.keyName');

exports.init = function init(env) {
    return Promise.resolve(env);
};

exports.find = function find(env, query) {
    return redisClient.smembersAsync(key).then((v) => {
        return Promise.resolve(v);
    }).catch((e) => {
        log.error(e);
        return Promise.reject(e);
    });
};
