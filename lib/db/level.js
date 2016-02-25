const config = require('config'),
  path = require('path'),
  levelup = require('level'),
  log = require('../logger'),
  Promise = require('bluebird'),
  CONFIG_PATH = path.resolve(__dirname, '..', '..', 'config'),
  DB_PATH = path.resolve(CONFIG_PATH, config.get('dbConfig.leveldb.location')),
  db = levelup(DB_PATH, {
    valueEncoding: 'json'
  });

/**
 * Retrieves the value containing file paths for the given app id from the db store.
 *
 * @id {String} the app id (packageName-versionCode)
 * @callback callback - The callback that handles the response.
 * @return {Object} An object that contains the path for each data type.
 * Example: {listing: '/path/com.app-123.json', ui: '/path/com.app-123.xml'}
 * @return {Function} callback A callback function that handles the result.
 */
function dbGet(id, callback) {
  db.get(id, (err, value) => {
    if (err) {
      callback(err);
    }
    callback(null, value);
  });
}
/**
 * Inserts a key and an object value containing file paths to the db store.
 *
 * @param {String} id the app id (packageName-versionCode)
 * @param {Object} value An object that contains the path for each data type.
 * Example: {listing: '/path/com.app-123.json', ui: '/path/com.app-123.xml'}
 * @return {Function} callback A callback function that handles the result.
 */
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
 * readFullDB - logs all the content of the data store at the info level.
 *
 * @param  {Function} callback A callback function that handles the response
 * @return {Function} callback A callback function that handles the result.
 */
function readFullDB(callback) {
  db.createReadStream()
    .on('data', (data) => {
      log.info(data.key, '=>', JSON.stringify(data.value));
    })
    .on('error', (err) => {
      log.error('Failed to read full db', err);
      callback(err);
    })
    .on('close', () => {
      callback();
    });
}

exports.dbGetAsync = Promise.promisify(dbGet);
exports.dbPutAsync = Promise.promisify(dbPut);
exports.readFullDB = Promise.promisify(readFullDB);
