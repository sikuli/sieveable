'use strict';
const Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    config = require('config'),
    redis = require('redis'),
    log = require('../logger'),
    DATASET_PATH = path.resolve(__dirname, '../../', 'config', config.get('dataset.path')),
    uiKey = config.get('dataset.uiKeyName'),
    manifestKey = config.get('dataset.manifestKeyName'),
    codeKey = config.get('dataset.codeKeyName'),
    apps = {},
    client = redis.createClient();
Promise.promisifyAll(redis);

apps.init = (type) => {
    const redisKeys = [
        { type: 'ui', key: uiKey },
        { type: 'manifest', key: manifestKey },
        { type: 'code', key: codeKey }],
        i = _.findIndex(redisKeys, { 'type': type });
    if (i !== -1) {
        return client.smembersAsync(redisKeys[i].key).then((ids) => {
            apps.ids = ids;
            return apps;
        });
    }
    // otherwise, unkonown findBy plugin.
    return Promise.reject(new Error('Unknown findBy dataset type'));
};

// get an app by its id, with fields specified in 'projection'
apps.get = function getAppById(id, projection) {
    if (projection === undefined) {
        return {};
    }
    const uiFile = path.join(DATASET_PATH, 'ui', id + '.xml'),
        manifestFile = path.join(DATASET_PATH, 'manifest', id + '.xml'),
        app = _getApp(id);

    if (projection.dom) {
        if (fs.existsSync(uiFile)) {
            const ui = fs.readFileSync(uiFile, 'utf8');
            app.dom = cheerio.load(ui, {
                recognizeSelfClosing: true,
                xmlMode: true
            });
        }
    }

    if (projection.manifest) {
        if (fs.existsSync(manifestFile)) {
            const manifest = fs.readFileSync(manifestFile, 'utf8');
            app.manifest = cheerio.load(manifest, {
                recognizeSelfClosing: true,
                xmlMode: true
            });
        }
    }

    if (projection.listings) {
        // TODO: return listing details collection ids
        log.info('listings projection');
    }

    if (projection.code) {
        // TODO: return API docs
        log.info('code projection');
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
        listing = projection.listing ? _getProjectionAttributes(options.listingResult, id) : {},
        ui = projection.ui ? _getProjectionAttributes(options.uiResult, id) : {},
        manifest = projection.manifest ? _getProjectionAttributes(options.manifestResult, id) : {};
    _renameReturnFields(listing, returnFields, 'l$');
    _renameReturnFields(manifest, returnFields, 'm$');
    _renameReturnFields(ui, returnFields, 'u$');
    return {
        app: app, listing: listing, ui: ui, manifest: manifest
    };
};

function _renameReturnFields(resultObj, returnFields, prefix) {
    if (returnFields.length === 1 || _.isEmpty(resultObj)) {
        return resultObj;
    }
    const fields = _.filter(returnFields, (f) => {
        return f.trim().toLowerCase().indexOf(prefix) === 0;
    });
    if (resultObj && resultObj.returnAttributes) {
        if (fields.length > 0) {
            const keys = Object.keys(resultObj.returnAttributes);
            _.forEach(fields, (f, idx) => {
                const asIndex = f.trim().toLowerCase().indexOf('as');
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
    const obj = _.find(results, { id: id });
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
        id: id,
        packageName: idVal[0],
        version: idVal[1]
    };
}

module.exports = apps;
