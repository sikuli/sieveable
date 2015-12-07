'use strict';
const Promise = require('bluebird'),
    redis = require('redis'),
    config = require('config'),
    log = require('../../logger'),
    client = redis.createClient(),
    key = config.get('dataset.keyName');

exports.init = function init(env) {
    return Promise.resolve(env);
};

exports.find = function find(env, query) {
    return new Promise((resolve, reject) => {
        client.smembers(key, (err, res) => {
            if (err) {
                log.error(err);
                reject(err);
            }
            resolve(res);
        });
    });
};
