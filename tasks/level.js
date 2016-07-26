const gulp = require('gulp'),
  Promise = require('bluebird'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  config = require('config'),
  levelDB = require('../lib/db/level'),
  _ = require('lodash'),
  cheerio = require('cheerio'),
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
  const dirs = _.map(config.dataset[datasetType], 'target'),
    dirPaths = _.map(dirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(dirPaths, (dirPath) => {
    return fs.readdirAsync(dirPath)
        .map((fileName) => {
          const id = path.basename(fileName, extension),
            fileAbsPath = path.join(dirPath, fileName);
          return levelDB.dbGetAsync(id)
            .then((val) => {
              const result = val;
              result[datasetType] = fileAbsPath;
              if (datasetType === 'manifest') {
                return addVersionName(result, fileAbsPath);
              }
              return Promise.resolve(result);
            })
            .then((result) => {
              return levelDB.dbPutAsync(id, result);
            })
            .then(() => {
              log.info('Inserted %s path for %s', datasetType, id);
            })
            .catch((getErr) => {
              if (getErr.notFound) {
                const val = {};
                val[datasetType] = fileAbsPath;
                return levelDB.dbPutAsync(id, val)
                  .then(() => {
                    log.info('Inserted %s path for %s', datasetType,
                      id);
                  });
              }
              log.error('Failed to find %s ', id, getErr);
              return Promise.reject(getErr);
            });
        }, { concurrency: 400 });
  }, { concurrency: 2 })
    .then(() => {
      log.info('Finished inserting %s path values.', datasetType);
    })
    .catch((e) => {
      log.error('Error ', e);
      return Promise.reject(e);
    });
}

function insertVersionName() {
  const dirs = _.map(config.dataset.manifest, 'target'),
    dirPaths = _.map(dirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(dirPaths, (dirPath) => {
    return fs.readdirAsync(dirPath)
        .map((fileName) => {
          const id = path.basename(fileName, '.xml'),
            fileAbsPath = path.join(dirPath, fileName);
          return levelDB.dbGetAsync(id)
            .then((val) => {
              return addVersionName(val, fileAbsPath);
            })
            .then((result) => {
              return levelDB.dbPutAsync(id, result);
            })
            .then(() => {
              log.info('Inserted version name for %s', id);
            })
            .catch((getErr) => {
              log.error('Failed to find %s ', id, getErr);
              return Promise.reject(getErr);
            });
        }, { concurrency: 400 });
  }, { concurrency: 2 })
    .then(() => {
      log.info('Finished inserting version name values.');
    })
    .catch((e) => {
      log.error('Error ', e);
      return Promise.reject(e);
    });
}


// Add the app's version name from the manifest file to the result
function addVersionName(result, manifestPath) {
  const resultObj = result;
  return fs.readFileAsync(manifestPath)
    .then((content) => {
      const $ = cheerio.load(content, { xmlMode: true });
      resultObj.vern = $('manifest').attr('versionName');
      return resultObj;
    });
}

gulp.task('leveldb:create', (callback) => {
  // create leveldb data directory.
  mkdirp.sync(path.resolve(CONFIG_PATH, config.get(
    'dbConfig.leveldb.location')), { mode: '2775' });
  callback();
});

gulp.task('leveldb:readFullDB', () => {
  return levelDB.readFullDB();
});

gulp.task('leveldb:addManifest', () => {
  return insertToLevel('manifest', '.xml');
});

gulp.task('leveldb:addVersionName', () => {
  return insertVersionName();
});

gulp.task('leveldb:addUI', () => {
  return insertToLevel('ui', '.xml');
});
