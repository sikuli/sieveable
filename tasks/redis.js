'use strict';
const gulp = require('gulp'),
    config = require('config'),
    Promise = require('bluebird'),
    log = require('../lib/logger'),
    redisAdmin = require('../lib/index/redis-admin'),
    listingKey = config.get('dataset.listingKeyName'),
    uiKey = config.get('dataset.uiKeyName'),
    manifestKey = config.get('dataset.manifestKeyName'),
    codeKey = config.get('dataset.codeKeyName');

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
