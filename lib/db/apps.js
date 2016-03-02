'use strict';
const Promise = require('bluebird'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  _ = require('lodash'),
  config = require('config'),
  redis = require('redis'),
  log = require('../logger'),
  levelDB = require('./level'),
  uiKey = config.get('dataset.uiKeyName'),
  listingKey = config.get('dataset.listingKeyName'),
  manifestKey = config.get('dataset.manifestKeyName'),
  codeKey = config.get('dataset.codeKeyName'),
  apps = {},
  client = redis.createClient();
Promise.promisifyAll(redis);

apps.init = (type) => {
  log.info('Initializing %s', type);
  const redisKeys = [
    {
      type: 'ui',
      key: uiKey
    },
    {
      type: 'manifest',
      key: manifestKey
    },
    {
      type: 'code',
      key: codeKey
    },
    {
      type: 'listing',
      key: listingKey
    }],
    i = _.findIndex(redisKeys, { type });
  if (i !== -1) {
    log.info('Getting redis values for key %s.', redisKeys[i].key);
    return client.smembersAsync(redisKeys[i].key)
      .then((ids) => {
        log.info('Successfully initialized %d ids for %s.', ids.length, type);
        return ids;
      });
  }
  // otherwise, unkonown data type
  log.error('Unable to initialized %s. Unknown data type.');
  return Promise.reject(new Error('Unknown findBy dataset type'));
};

/**
 * Gets all file paths by an app id.
 * It queries the leveldb store by the app id and returns the value.
 * @param {String} id the app id (packageName-versionCode).
 * @return {Object} app Returns an app object that contains the app id along
 * with all paths to different dataset types (e.g., ui, listing, and manifest).
 */
apps.getPath = function getPathById(id) {
  return levelDB.dbGetAsync(id)
    .then((appPaths) => {
      const appObject = appPaths;
      appObject.id = id;
      return appObject;
    })
    .catch((e) => {
      if (e.notFound) {
        log.error('Path values for %s are not found in leveldb.', id);
        return Promise.reject(e);
      }
      log.error('LevelDB I/O error while trying to find app path for %s.',
        id, e);
      return Promise.reject(e);
    });
};

/**
 * Reads the content of an app dataset whose type is specified as a projection.
 *
 * @param appPath {Object} Object that contains the app id, ui file path,
 * manifest file path, and listing file path.
 * the app id and the paths to its data/content files.
 * @param projection {Object} An object that indicates what content
 * type (ui, manifest, and listing) to read.
 * @return {{id, packageName, versionCode}}
 */
apps.loadData = function loadData(appPath, projection) {
  const app = _getApp(appPath.id);
  if (projection.dom) {
    app.dom = loadDOM(appPath.ui);
  }
  if (projection.manifest) {
    app.manifest = loadDOM(appPath.manifest);
  }
  if (projection.listing) {
    app.listing = loadJSONFile(appPath.listing);
  }
  return app;
};
/**
 *
 * @param id an app (e.g., id com.myapp-123)
 * @param options
 * @param projection (e.g., {app: true, listing:true, ui: true, manifest:true})
 * @return Object app e.g.({ id: '', packageName: '', version: ,
 * listing: { '$1': 'val' }, ui: { '$1': 'val' }, manifest: { '$1': 'val' } })
 */
apps.project = function applyProjection(id, options, projection, returnFields) {
  const app = projection.app ? _getApp(id) : {},
    listing = projection.listing ? _getProjectionAttributes(options.listingResult,
      id) : {},
    ui = projection.ui ? _getProjectionAttributes(options.uiResult, id) : {},
    manifest = projection.manifest ? _getProjectionAttributes(options.manifestResult,
      id) : {};
  _renameReturnFields(listing, returnFields, 'l$');
  _renameReturnFields(manifest, returnFields, 'm$');
  _renameReturnFields(ui, returnFields, 'u$');
  return {
    app, listing, ui, manifest
  };
};

function loadJSONFile(file) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  }
  return undefined;
}

function loadDOM(file) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    return cheerio.load(content, {
      recognizeSelfClosing: true,
      xmlMode: true
    });
  }
  return undefined;
}

function _renameReturnFields(result, returnFields, prefix) {
  const resultObj = result,
    fields = _.filter(returnFields, (f) => {
      return f.trim()
        .toLowerCase()
        .indexOf(prefix) === 0;
    });
  if (resultObj && resultObj.returnAttributes) {
    if (fields.length > 0) {
      const keys = Object.keys(resultObj.returnAttributes);
      _.forEach(fields, (f, idx) => {
        const asIndex = f.trim()
          .toLowerCase()
          .indexOf('as');
        let newName;
        if (asIndex > -1) {
          newName = f.trim().substring(asIndex + 2, f.length);
        }
        if (newName.length > 0) {
          const newPropertyName = newName.replace(/ /g, '');
          resultObj.returnAttributes[newPropertyName] =
            resultObj.returnAttributes[keys[idx]];
          delete resultObj.returnAttributes[keys[idx]];
        }
      });
    }
  }
}

function _getProjectionAttributes(results, id) {
  const obj = _.find(results, {
    id
  });
  if (!obj) {
    return {};
  }
  const keys = _.without(Object.keys(obj), 'id'),
    result = {};
  _.forEach(keys, (k) => {
    result[k] = obj[k];
  });
  return result;
}

function _getApp(id) {
  const idVal = id.split('-');
  return {
    id,
    packageName: idVal[0],
    version: idVal[1]
  };
}

module.exports = apps;
