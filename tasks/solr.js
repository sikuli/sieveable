'use strict';
const gulp = require('gulp'),
    Promise = require('bluebird'),
    config = require('config'),
    path = require('path'),
    glob = require('glob'),
    solrIndex = require('../lib/index/solr-index'),
    solrAdmin = require('../lib/index/solr-admin'),
    log = require('../lib/logger'),
    DATASET_PATH = path.resolve(__dirname + '/../', 'config', config.get('dataset.path'));

gulp.task('solr:create', (callback) => {
    const collections = [config.get('dbConfig.solr.uiTagCollection'),
        config.get('dbConfig.solr.uiSuffixCollection'),
        config.get('dbConfig.solr.manifestCollection'),
        config.get('dbConfig.solr.codeCollection')];
    Promise.all([solrAdmin.createCollection(collections[0]),
        solrAdmin.createCollection(collections[1]),
        solrAdmin.createCollection(collections[2]),
        solrAdmin.createCollection(collections[3])])
        .then(() => {
            callback();
        })
        .catch((e) => {
            log.error('ERROR: ' + e.message);
            callback(e);
        });
});

gulp.task('solr:addField', (callback) => {
    const collections = [config.get('dbConfig.solr.uiTagCollection'),
                         config.get('dbConfig.solr.uiSuffixCollection'),
                         config.get('dbConfig.solr.manifestCollection'),
                         config.get('dbConfig.solr.codeCollection')],
        packageField = {
            'name': 'package_name',
            'type': 'string',
            'indexed': true,
            'required': true,
            'stored': true
        },
        versionCodeField = {
            'name': 'version_code',
            'type': 'int',
            'indexed': true,
            'required': true,
            'stored': true
        };

    Promise.all([
        solrAdmin.addField(collections[0], packageField),
        solrAdmin.addField(collections[0], versionCodeField),
        solrAdmin.addField(collections[1], packageField),
        solrAdmin.addField(collections[1], versionCodeField),
        solrAdmin.addField(collections[2], packageField),
        solrAdmin.addField(collections[2], versionCodeField),
        solrAdmin.addField(collections[3], packageField),
        solrAdmin.addField(collections[3], versionCodeField),
    ])
        .then(() => {
            callback();
        })
        .catch((e) => {
            log.error('ERROR: ' + e.message);
            callback(e);
        });
});

gulp.task('solr:indexUITag', (callback) => {
    const dir = path.resolve(__dirname + '/../', 'config', config.get('indexes.extractUITagDir')),
        collectionName = config.get('dbConfig.solr.uiTagCollection');
    glob(path.join(dir, '*.txt'), (err, files) => {
        solrIndex.index(files, '-ui-tag.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexUISuffix', (callback) => {
    const dir = path.resolve(__dirname + '/../', 'config', config.get('indexes.extractUISuffixDir')),
        collectionName = config.get('dbConfig.solr.uiSuffixCollection');
    glob(path.join(dir, '*.txt'), (err, files) => {
        solrIndex.index(files, '-ui-suffix.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexManifest', (callback) => {
    const dir = path.resolve(__dirname + '/../', 'config', config.get('indexes.extractManifestDir')),
        collectionName = config.get('dbConfig.solr.manifestCollection');
    glob(path.join(dir, '*.txt'), (err, files) => {
        solrIndex.index(files, '-manifest-tag.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexCode', (callback) => {
    const collectionName = config.get('dbConfig.solr.codeCollection');
    glob(path.join(DATASET_PATH, 'code', '*.txt'), (er, files) => {
        solrIndex.index(files, '.smali.txt', collectionName, (err) => {
            callback(err);
        });
    });
});

gulp.task('solr:commit', (callback) => {
    const collectionName = config.get('dbConfig.solr.codeCollection');
    solrIndex.commit(collectionName)
        .then(() => {
            callback();
        })
        .catch((err) => {
            callback(err);
        });
});
