'use strict';
const gulp = require('gulp'),
    glob = require('glob'),
    path = require('path'),
    exec = require('child_process').exec,
    Promise = require('bluebird'),
    execAsync = Promise.promisify(exec),
    config = require('config'),
    mkdirp = require('mkdirp'),
    log = require('../lib/logger'),
    tagNameExtractor = require('../lib/index/tag-name-extractor'),
    suffixExtractor = require('../lib/index/suffix-extractor'),
    DATASET_PATH = path.resolve(__dirname + '/../', 'config',
    config.get('dataset.path'));

gulp.task('extract:archives', (done) => {
    const untarListings = 'tar xvjf ' + path.join(DATASET_PATH, 'listing',
            'listing.tar.bz2') + ' -C ' + path.join(DATASET_PATH, 'listing'),
        untarUI = 'tar xvjf ' + path.join(DATASET_PATH, 'ui', 'ui-xml.tar.bz2') +
                  ' -C ' + path.join(DATASET_PATH, 'ui'),
        untarManifest = 'tar xvjf ' + path.join(DATASET_PATH, 'manifest',
                        'manifest.tar.bz2') + ' -C ' + path.join(DATASET_PATH,
            'manifest'),
        untarCode = 'tar xvjf ' + path.join(DATASET_PATH, 'code',
                    'smali-invoked-methods.tar.bz2') + ' -C ' +
                     path.join(DATASET_PATH, 'code');

    log.info('Extracting listing details json files...');
    execAsync(untarListings)
        .then(() => {
            log.info('Extracting UI xml files...');
            return execAsync(untarUI);
        })
        .then(() => {
            log.info('Extracting Manifest xml files...');
            return execAsync(untarManifest);
        })
        .then(() => {
            log.info('Extracting code text files...');
            return execAsync(untarCode);
        })
        .then(() => {
            log.info('All archives have been extracted.');
            done();
        })
        .error((error) => {
            log.error(error);
            done(error);
        });
});

gulp.task('extract:ui-tag', (callback) => {
    // create a directory that contains all extracted files.
    const dir = path.resolve(__dirname + '/../', 'config',
                             config.get('indexes.extractUITagDir'));
    mkdirp.sync(dir, { mode: '2775' });
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), (err, files) => {
        tagNameExtractor(files, dir, '-ui-tag', (e) => {
            callback(e);
        });
    });
});

gulp.task('extract:ui-suffix', (callback) => {
    // create a directory that contains all extracted files.
    const dir = path.resolve(__dirname + '/../', 'config',
                             config.get('indexes.extractUISuffixDir'));
    mkdirp.sync(dir, { mode: '2775' });
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), (err, files) => {
        suffixExtractor(files, dir, (e) => {
            callback(e);
        });
    });
});

gulp.task('extract:manifest', (callback) => {
    // create a directory that contains all extracted files.
    const dir = path.resolve(__dirname + '/../', 'config',
        config.get('indexes.extractManifestDir'));
    mkdirp.sync(dir, { mode: '2775' });
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'manifest', '*.xml'), (err, files) => {
        tagNameExtractor(files, dir, '-manifest-tag', (e) => {
            callback(e);
        });
    });
});
