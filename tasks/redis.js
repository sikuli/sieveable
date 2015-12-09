'use strict';
const gulp = require('gulp'),
    config = require('config'),
    Promise = require('bluebird'),
    log = require('../lib/logger'),
    redisAdmin = require('../lib/index/redis-admin'),
    key = config.get('dataset.keyName'),
    uiKey = config.get('dataset.uiKeyName'),
    manifestKey = config.get('dataset.manifestKeyName'),
    codeKey = config.get('dataset.codeKeyName');

gulp.task('redis:addAllKeys', (callback) => {
    redisAdmin.insertDatasetKeys(key, [uiKey, manifestKey, codeKey])
        .then(() => {
            log.info('Successfully added all keys and values to the redis ' +
                'set collection %s', key);
            callback(null);
        })
        .catch((e) => {
            callback(e);
        });
});

gulp.task('redis:addSolrKeys', (callback) => {
    const collections = [config.get('dbConfig.solr.uiTagCollection'),
        config.get('dbConfig.solr.uiSuffixCollection'),
        config.get('dbConfig.solr.manifestCollection'),
        config.get('dbConfig.solr.codeCollection')];

    Promise.all([
        redisAdmin.insertSolrKeys(uiKey, collections[1]),
        redisAdmin.insertSolrKeys(manifestKey, collections[2]),
        redisAdmin.insertSolrKeys(codeKey, collections[3])])
        .then(() => {
            log.info('Successfully added all ids stored in Solr collections ' +
                'to redis.');
            callback();
        }).catch((e) => {
            callback(e);
        });
});
