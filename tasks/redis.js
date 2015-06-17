var gulp = require('gulp');
var config = require('config');
var redis = require('redis');
var Promise = require("bluebird");
var log = require("../lib/logger");
var redisAdmin = require('../lib/index/redis-admin');


gulp.task('redis:addKeys', function (done) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];

    var redisClient = redis.createClient();
    redisClient.on("error", function (err) {
        log.error("Error " + err);
        throw (err);
    });
    var key = config.get('dataset.keyName');
    var indexKey = config.get('dataset.indexKeyName');
    var uiKey = config.get('dataset.uiKeyName');
    var manifestKey = config.get('dataset.manifestKeyName');
    var codeKey = config.get('dataset.codeKeyName');

    Promise.join(
        redisAdmin.insertSet(indexKey, collections[0], redisClient),
        redisAdmin.insertSet(uiKey, collections[1], redisClient),
        redisAdmin.insertSet(manifestKey, collections[2], redisClient),
        redisAdmin.insertSet(codeKey, collections[3], redisClient), function () {
            log.info('Successfully added all keys and values to redis.');
        })
        .then(function () {
            return redisAdmin.insertUnion(key, redisClient);
        })
        .then(function () {
            log.info('Successfully added all keys and values to the redis ' +
                'set collection ' + key);
            redisClient.quit();
            done();
        })
        .catch(function (e) {
            throw e;
        });
});

