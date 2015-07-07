var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var _ = require('lodash');
var config = require("config");
var redis = require('redis');
var log = require("../logger");
var DATASET_PATH = path.resolve(__dirname, '../../', 'config', config.get('dataset.path'));
var uiKey = config.get('dataset.uiKeyName');
var manifestKey = config.get('dataset.manifestKeyName');
var codeKey = config.get('dataset.codeKeyName');
var apps = {};
Promise.promisifyAll(require("redis"));
var client = redis.createClient();

apps.init = function (type) {
    var redisKeys = [
        {type: 'ui', key: uiKey},
        {type: 'manifest', key: manifestKey},
        {type: 'code', key: codeKey}];
    var i = _.findIndex(redisKeys, {'type': type});
    if (i != -1) {
        return client.smembersAsync(redisKeys[i].key).then(function (ids) {
            apps.ids = ids;
            return apps
        })
    }
    else {
        return Promise.reject(new Error("Unknown findBy dataset type"));
    }
};

// get an app by its id, with fields specified in 'projection'
apps.get = function (id, projection) {

    var projection = projection || {};

    var uiFile = path.join(DATASET_PATH, 'ui', id + '.xml');
    var manifestFile = path.join(DATASET_PATH, 'manifest', id + '.xml');
    var app = _getApp(id);

    if (projection.dom) {
        if (fs.existsSync(uiFile)) {
            var ui = fs.readFileSync(uiFile, 'utf8');
            app.dom = cheerio.load(ui, {
                recognizeSelfClosing: true,
                xmlMode: true
            });
        }
    }

    if (projection.xml) {
        app.xml = xml || fs.readFileSync(uiFile, 'utf8');
    }

    if (projection.manifest) {
        if (fs.existsSync(manifestFile)) {
            var manifest = fs.readFileSync(manifestFile, 'utf8');
            app.manifest = cheerio.load(manifest, {
                recognizeSelfClosing: true,
                xmlMode: true
            })
        }
    }

    if (projection.listings) {
        //TODO: return listing details collection ids
        log.info('listings projection');
    }

    if (projection.perm) {
        if (fs.existsSync(path.join(DATASET_PATH, 'perm', id + '.json'))) {
            app.perm = unpickle(path.join(DATASET_PATH, 'perm', id + '.json'));
        }
        else {
            app.perm = '    '
        }
        return Promise.resolve(app);
    }

    return app
};
/**
 *
 * @param id an app (e.g., id com.myapp-123)
 * @param options
 * @param projection (e.g., {app: true, listing:true, ui: true, manifest:true})
 * @return Object app e.g.({ id: '', packageName: '', version: ,
 * listing: { '$1': 'val' }, ui: { '$1': 'val' }, manifest: { '$1': 'val' } })
 */
apps.project = function (id, options, projection) {
    var app = projection.app ? _getApp(id) : {};
    var listing = projection.listing ? _getProjectionAttributes(options.listingResult, id) : {};
    var ui = projection.ui ? _getProjectionAttributes(options.uiResult, id) : {};
    var manifest = projection.manifest ? _getProjectionAttributes(options.manifestResult, id) : {};
    return {
        app: app, listing: listing, ui: ui, manifest: manifest
    }
}

function _getProjectionAttributes(results, id) {
    var obj = _.find(results, {id: id});
    if (!obj) {
        return {};
    }
    var keys = _.without(Object.keys(obj), 'id');
    var result = {};
    _.forEach(keys, function (k) {
        result[k] = obj[k];
    });
    return result;
}

function _getApp(id) {
    var idVal = id.split('-');
    return {
        id: id,
        packageName: idVal[0],
        version: idVal[1]
    };
}

module.exports = apps;