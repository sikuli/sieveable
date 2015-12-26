'use strict';
const gulp = require('gulp'),
    Promise = require('bluebird'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    config = require('config'),
    levelup = require('level'),
    _ = require('lodash'),
    fs = Promise.promisifyAll(require('fs')),
    log = require('../lib/logger'),
    CONFIG_PATH = path.resolve(__dirname + '/../', 'config'),
    DB_PATH = path.resolve(CONFIG_PATH, config.get('dbConfig.leveldb.location')),
    db = levelup(DB_PATH, { valueEncoding: 'json' }),
    dbGetAsync = Promise.promisify(dbGet),
    dbPutAsync = Promise.promisify(dbPut);

function dbGet(id, callback) {
    db.get(id, (err, value) => {
        if (err) {
            callback(err);
        }
        callback(null, value);
    });
}

function dbPut(id, value, callback) {
    return db.put(id, value, (err) => {
        if (err) {
            log.error('Failed to insert values for %s', id, err);
            callback(err);
        }
        callback(null, value);
    });
}
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
    return Promise.map(dirPaths, (dirPath) => {
        return fs.readdirAsync(dirPath)
                 .map((fileName) => {
                     const id = path.basename(fileName, extension),
                         fileAbsPath = path.join(dirPath, fileName);
                     return dbGetAsync(id)
                       .then((val) => {
                           val[datasetType] = fileAbsPath;
                           return dbPutAsync(id, val);
                       })
                       .then(() => {
                           log.info('Inserted %s path for %s', datasetType, id);
                       })
                       .catch((getErr) => {
                           if (getErr.notFound) {
                               const val = {};
                               val[datasetType] = fileAbsPath;
                               return dbPutAsync(id, val);
                           }
                           log.error('Failed to find %s ', id, getErr);
                       });
                 });
    }).then(() => {
        log.info('Finished inserting listing details path values.');
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

gulp.task('leveldb:readFullDB', (callback) => {
    db.createReadStream()
    .on('data', (data) => {
        log.info(data.key, '=>', JSON.stringify(data.value));
    })
    .on('error', (err) => {
        log.error('Failed to read full db', err);
        callback(err);
    })
    .on('close', () => {
        console.log('Stream closed');
        callback();
    });
});

gulp.task('leveldb:addListing', ['leveldb:create'], () => {
    insertToLevel('listing', '.json');
});

gulp.task('leveldb:addManifest', ['leveldb:create'], () => {
    insertToLevel('manifest', '.xml');
});

gulp.task('leveldb:addUI', ['leveldb:create'], () => {
    insertToLevel('ui', '.xml');
});
