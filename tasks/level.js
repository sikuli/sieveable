'use strict';
const gulp = require('gulp'),
    Promise = require('bluebird'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    config = require('config'),
    levelDB = require('../lib/db/level'),
    _ = require('lodash'),
    fs = Promise.promisifyAll(require('fs')),
    log = require('../lib/logger'),
    CONFIG_PATH = path.resolve(__dirname, '..', 'config');

/**
* Insert keys (app ids) and values (file path names) into leveldb.
*
* @datasetType The type of the dataset (e.g., listing, manifest, or ui).
* @extension  file extension name (e.g., .xml, or .json).
*/
function insertToLevel(datasetType, extension) {
    const dirs = _.pluck(config.dataset[datasetType], 'target'),
        dirPaths = _.map(dirs, (dir) => {
            return path.resolve(CONFIG_PATH, dir);
        });
    // TODO: Remove this
    console.log(dirPaths);
    return Promise.map(dirPaths, (dirPath) => {
        return fs.readdirAsync(dirPath)
                 .map((fileName) => {
                     const id = path.basename(fileName, extension),
                         fileAbsPath = path.join(dirPath, fileName);
                     console.log(fileAbsPath);
                     return levelDB.dbGetAsync(id)
                       .then((val) => {
                           console.log(val);
                           val[datasetType] = fileAbsPath;
                           return levelDB.dbPutAsync(id, val);
                       })
                       .then(() => {
                           log.info('Inserted %s path for %s', datasetType, id);
                       })
                       .catch((getErr) => {
                           if (getErr.notFound) {
                               const val = {};
                               val[datasetType] = fileAbsPath;
                               return levelDB.dbPutAsync(id, val);
                           }
                           log.error('Failed to find %s ', id, getErr);
                       });
                 });
    }).then(() => {
        log.info('Finished inserting %s path values.', datasetType);
    }).catch((e) => {
        log.error('Error ', e);
        return Promise.reject(e);
    });
}

gulp.task('leveldb:create', (callback) => {
    // create leveldb data directory.
    mkdirp.sync(path.resolve(CONFIG_PATH, config.get('dbConfig.leveldb.location'))
              , { mode: '2775' });
    callback();
});

gulp.task('leveldb:readFullDB', () => {
    return levelDB.readFullDB();
});

gulp.task('leveldb:addListing', () => {
    return insertToLevel('listing', '.json');
});

gulp.task('leveldb:addManifest', () => {
    return insertToLevel('manifest', '.xml');
});

gulp.task('leveldb:addUI', () => {
    return insertToLevel('ui', '.xml');
});
