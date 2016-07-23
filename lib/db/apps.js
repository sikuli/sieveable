'use strict';
const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  cheerio = require('cheerio'),
  _ = require('lodash'),
  log = require('../logger'),
  levelDB = require('./level'),
  apps = {};

/**
 * Gets all file paths by an app id.
 * It queries the leveldb store by the app id and returns the value.
 * @param {String} id the app id (packageName-versionCode).
 * @return {Object} app Returns an app object that contains the app id along
 * with all paths to different dataset types (e.g., ui, listing, and manifest).
 */
function getPathById(id) {
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
}
apps.getPath = getPathById;
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
  return Promise.props(app);
};
/**
 *
 * @param id an app (e.g., id com.myapp-123)
 * @param options
 * @param projection (e.g., {app: true, listing:true, ui: true, manifest:true})
 * @return Object A Promise whose fulfillment value is an Object.
 * e.g.({ id: '', packageName: '', versionCode: , versionName:,
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
  return getPathById(app.id)
    .then((appPath) => {
      const verc = _.toNumber(app.versionCode);
      return {
        id: app.id, packageName: app.packageName,
        versionCode: verc, versionName: appPath.vern,
        listing, ui, manifest
      };
    });
};

function loadJSONFile(file) {
  return fs.readFileAsync(file, 'utf8')
  .then((content) => {
    return JSON.parse(content);
  })
  .catch(() => {
    return undefined;
  });
}

function loadDOM(file) {
  return fs.readFileAsync(file, 'utf8')
  .then((content) => {
    return cheerio.load(content, {
      recognizeSelfClosing: true,
      xmlMode: true
    });
  })
  .catch(() => {
    return undefined;
  });
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
    versionCode: idVal[1]
  };
}

module.exports = apps;
