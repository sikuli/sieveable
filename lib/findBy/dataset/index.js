var Promise = require('bluebird');
var redis = require('redis');
var config = require('config');
var _ = require('lodash');

var client = redis.createClient();
var key = config.get("dataset.keyName");

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return Promise.resolve(env);
}

function find(env, query) {
    return new Promise(function (resolve, reject) {

        client.smembers(key, function (err, res) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(res);
        });
    });
}
