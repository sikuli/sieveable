var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var _ = require('lodash');
var config = require("config");
var redis = require('redis');
var log = require("../logger");
var DATASET_PATH = path.resolve(__dirname, '../../', 'config', config.get('dataset.path'));
var indexKey = config.get("dataset.indexKeyName");
var uiKey = config.get('dataset.uiKeyName');
var manifestKey = config.get('dataset.manifestKeyName');
var codeKey = config.get('dataset.codeKeyName');
var apps = {};
Promise.promisifyAll(require("redis"));
var client = redis.createClient();

apps.init = function (type) {
    var redisKeys = [
        {type: 'index', key: indexKey},
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

    var idVal = id.split('-');

    var app = {
        id: id,
        packageName: idVal[0],
        version: idVal[1]
    };

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


function unpickle(src) {
    var contents = fs.readFileSync(src, 'utf8');
    var data = [];
    var JSONPickle = function (o) {
        data.push(o)
    };
    eval(contents);

    var gs = _.groupBy(data, '$type');
    return {
        appData: gs['edu.colorado.permgrep.appData'][0],
        perms: gs['edu.colorado.permgrep.onePerm']
    }
}

module.exports = apps;