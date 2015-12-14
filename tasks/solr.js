'use strict';
const gulp = require('gulp'),
    Promise = require('bluebird'),
    config = require('config'),
    path = require('path'),
    glob = require('glob'),
    through = require('through2'),
    solrIndex = require('../lib/index/solr-index'),
    solrAdmin = require('../lib/index/solr-admin'),
    log = require('../lib/logger'),
    DATASET_PATH = path.resolve(__dirname + '/../', 'config', config.get('dataset.path'));

gulp.task('solr:create', (callback) => {
    const collections = [
        config.get('dbConfig.solr.listingCollection'),
        config.get('dbConfig.solr.uiTagCollection'),
        config.get('dbConfig.solr.uiSuffixCollection'),
        config.get('dbConfig.solr.manifestCollection'),
        config.get('dbConfig.solr.codeCollection')];
    Promise.all([solrAdmin.createCollection(collections[0]),
        solrAdmin.createCollection(collections[1]),
        solrAdmin.createCollection(collections[2]),
        solrAdmin.createCollection(collections[3]),
        solrAdmin.createCollection(collections[4])])
        .then(() => {
            callback();
        })
        .catch((e) => {
            log.error('ERROR: ' + e.message);
            callback(e);
        });
});

gulp.task('solr:addKeyFields', (callback) => {
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

// add all listing detail fields to the schema
gulp.task('solr:addListingFields', (callback) => {
   const collection = config.get('dbConfig.solr.listingCollection'),
       packageField = {
           'name': 'n',
           'type': 'string',
           'indexed': true,
           'required': true,
           'stored': true
       },
        versionCodeField = {
            'name': 'verc',
            'type': 'int',
            'indexed': true,
            'required': true,
            'stored': true
        },
       creatorAddressField = {
           'name': 'cadd',
           'type': 'text_general',
           'indexed': true,
           'required': false,
           'stored': true
       },
       categoryField = {
           'name': 'cat',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       contentRatingField = {
           'name': 'crat',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       creatorField = {
           'name': 'crt',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       creatorUrlField = {
           'name': 'curl',
           'type': 'string',
           'indexed': false,
           'required': false,
           'stored': true
       },
       minDownloadCountField = {
           'name': 'dct',
           'type': 'long',
           'indexed': true,
           'required': false,
           'stored': true
       },
       descriptionField = {
           'name': 'desc',
           'type': 'text_general',
           'indexed': true,
           'required': false,
           'stored': true
       },
       datePublishedField = {
           'name': 'dtp',
           'type': 'text_general',
           'indexed': true,
           'required': false,
           'stored': true
       },
       downloadCountTextField = {
           'name': 'dtxt',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       whatsNewField = {
           'name': 'new',
           'type': 'text_general',
           'indexed': true,
           'required': false,
           'stored': true
       },
       osField = {
           'name': 'os',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       priceField = {
           'name': 'pri',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       privacyUrlField = {
           'name': 'purl',
           'type': 'string',
           'indexed': false,
           'required': false,
           'stored': true
       },
       starRatingField = {
           'name': 'rate',
           'type': 'float',
           'indexed': true,
           'required': false,
           'stored': true
       },
       ratingCountField = {
           'name': 'rct',
           'type': 'int',
           'indexed': true,
           'required': false,
           'stored': true
       },
       downloadSizeField = {
           'name': 'sz',
           'type': 'string',
           'indexed': true,
           'required': false,
           'stored': true
       },
       titleField = {
           'name': 't',
           'type': 'text_general',
           'indexed': true,
           'required': false,
           'stored': true
       };
    Promise.all([
        solrAdmin.addField(collection, packageField),
        solrAdmin.addField(collection, versionCodeField),
        solrAdmin.addField(collection, creatorField),
        solrAdmin.addField(collection, creatorAddressField),
        solrAdmin.addField(collection, categoryField),
        solrAdmin.addField(collection, contentRatingField),
        solrAdmin.addField(collection, creatorUrlField),
        solrAdmin.addField(collection, minDownloadCountField),
        solrAdmin.addField(collection, descriptionField),
        solrAdmin.addField(collection, datePublishedField),
        solrAdmin.addField(collection, downloadCountTextField),
        solrAdmin.addField(collection, downloadSizeField),
        solrAdmin.addField(collection, osField),
        solrAdmin.addField(collection, priceField),
        solrAdmin.addField(collection, privacyUrlField),
        solrAdmin.addField(collection, starRatingField),
        solrAdmin.addField(collection, ratingCountField),
        solrAdmin.addField(collection, whatsNewField),
        solrAdmin.addField(collection, titleField)
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
        solrIndex.indexFile(files, '-ui-tag.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexUISuffix', (callback) => {
    const dir = path.resolve(__dirname + '/../', 'config', config.get('indexes.extractUISuffixDir')),
        collectionName = config.get('dbConfig.solr.uiSuffixCollection');
    glob(path.join(dir, '*.txt'), (err, files) => {
        solrIndex.indexFile(files, '-ui-suffix.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexManifest', (callback) => {
    const dir = path.resolve(__dirname + '/../', 'config', config.get('indexes.extractManifestDir')),
        collectionName = config.get('dbConfig.solr.manifestCollection');
    glob(path.join(dir, '*.txt'), (err, files) => {
        solrIndex.indexFile(files, '-manifest-tag.txt', collectionName, (e) => {
            callback(e);
        });
    });
});

gulp.task('solr:indexCode', (callback) => {
    const collectionName = config.get('dbConfig.solr.codeCollection');
    glob(path.join(DATASET_PATH, 'code', '*.txt'), (er, files) => {
        solrIndex.indexFile(files, '.smali.txt', collectionName, (err) => {
            callback(err);
        });
    });
});

gulp.task('solr:indexListing', (callback) => {
    gulp.src(path.join(DATASET_PATH, 'listing', '*.json'))
        .pipe(new through.obj((file, encoding, cb) => {
            solrIndex.indexListing(file.contents).then(() =>{
                cb();
            }).catch((e)=>{
                cb(e);
            });
    }, () => {
            callback();
          }));
});

gulp.task('solr:commitAll', (callback) => {
    const solrConfig = config.get('dbConfig.solr');
    return Promise.all([
        solrIndex.commit(solrConfig.listingCollection),
        solrIndex.commit(solrConfig.uiTagCollection),
        solrIndex.commit(solrConfig.uiSuffixCollection),
        solrIndex.commit(solrConfig.manifestCollection),
        solrIndex.commit(solrConfig.codeCollection)
    ]).then(() => {
        log.info('Successfully committed changes to all indexes.');
    }).catch((e) => {
        log.error('Failed to commit all index changes. ', e);
        callback(e);
    });
});
