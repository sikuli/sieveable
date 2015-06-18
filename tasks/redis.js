var gulp = require('gulp');
var config = require('config');
var Promise = require("bluebird");
var log = require("../lib/logger");
var redisAdmin = require('../lib/index/redis-admin');

var key = config.get('dataset.keyName');
var indexKey = config.get('dataset.indexKeyName');
var uiKey = config.get('dataset.uiKeyName');
var manifestKey = config.get('dataset.manifestKeyName');
var codeKey = config.get('dataset.codeKeyName');

gulp.task('redis:addAllKeys', function (callback) {

    redisAdmin.insertDatasetKeys(key, [indexKey, uiKey, manifestKey,
        codeKey])
        .then(function () {
            log.info('Successfully added all keys and values to the redis ' +
                'set collection %s', key);
            callback(null);
        })
        .catch(function (e) {
            callback(e);
        });
})

gulp.task('redis:addSolrKeys', function (callback) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];

    Promise.all([
        redisAdmin.insertSolrKeys(indexKey, collections[0]),
        redisAdmin.insertSolrKeys(uiKey, collections[1]),
        redisAdmin.insertSolrKeys(manifestKey, collections[2]),
        redisAdmin.insertSolrKeys(codeKey, collections[3])])
        .then(function () {
            log.info('Successfully added all ids stored in Solr collections ' +
                'to redis.');
            callback();
        }).catch(function (e) {
            callback(e);
        });
})
