'use strict';
const gulp = require('gulp'),
    config = require('config'),
    Promise = require('bluebird'),
    log = require('../lib/logger'),
    redisAdmin = require('../lib/index/redis-admin'),
    key = config.get('dataset.keyName'),
    listingKey = config.get('dataset.listingKeyName'),
    uiKey = config.get('dataset.uiKeyName'),
    manifestKey = config.get('dataset.manifestKeyName'),
    codeKey = config.get('dataset.codeKeyName');

gulp.task('redis:addAllKeys', (callback) => {
    redisAdmin.insertDatasetKeys(key, [listingKey, uiKey, manifestKey, codeKey])
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
    Promise.all([
        redisAdmin.insertSolrKeys(listingKey,
                config.get('dbConfig.solr.listingCollection')),
        redisAdmin.insertSolrKeys(uiKey,
            config.get('dbConfig.solr.uiSuffixCollection')),
        redisAdmin.insertSolrKeys(manifestKey,
            config.get('dbConfig.solr.manifestCollection')),
        redisAdmin.insertSolrKeys(codeKey,
            config.get('dbConfig.solr.codeCollection'))
    ])
        .then(() => {
            log.info('Successfully added all ids stored in Solr collections ' +
                'to redis.');
            callback();
        }).catch((e) => {
            callback(e);
        });
});
