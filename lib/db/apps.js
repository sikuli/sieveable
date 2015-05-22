var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var _ = require('lodash');
var config = require("config");
var DATASET_PATH = path.resolve(__dirname, '../../', 'config', config.get('dataset.path'));

var glob = Promise.promisify(require("glob").glob);

var apps = {};

apps.init = function () {

    return glob(path.join(DATASET_PATH, 'ui', '*.xml'))
        .then(function (files) {
            apps.files = files;
            return apps;
        })
};

// get an app by its id, with fields specified in 'projection'
apps.get = function (id, projection) {

    var projection = projection || {};

    var uiFile = path.join(DATASET_PATH, 'ui', id + '.xml');
    var manifestFile = path.join(DATASET_PATH, 'manifest', id + '.xml');
    var xml;

    var app = {
        id: id
    };

    var idVal = id.split('-');
    app.packageName = idVal[0];
    app.version = idVal[1];

    if (projection.dom) {
        xml = fs.readFileSync(uiFile, 'utf8');
        app.dom = cheerio.load(xml, {
            recognizeSelfClosing: true,
            xmlMode: true
        });
    }

    if (projection.xml) {
        app.xml = xml || fs.readFileSync(uiFile, 'utf8');
    }

    if (projection.manifest) {
        var manifest = fs.readFileSync(manifestFile, 'utf8');
        app.manifest = cheerio.load(manifest, {
            recognizeSelfClosing: true,
            xmlMode: true
        })
    }

    if (projection.listings) {
        console.log('listings projection');
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