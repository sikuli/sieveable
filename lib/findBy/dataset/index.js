var Promise = require('bluebird');
var redis = require('redis');
var config = require('config');
var _ = require('lodash');
var Item = require('../../item');

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

    //var name = query.name;

    return new Promise(function (resolve, reject) {

        client.smembers(key, function (err, res) {
            if (err) {
                console.error(err);
                reject(err);
            }
            var allItems = _.map(res, function (id) {
                return new Item(id);
            })
            resolve(allItems);
        });
    });
}
