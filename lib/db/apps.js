var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio')

var glob = Promise.promisify(require("glob").glob)

var apps = {}

apps.init = function() {

    return glob(__dirname + '/../../fixtures/ui-xml/*')
        .then(function(files) {
            apps.files = files
            return apps
        })
}

// get an app by its id, with fields specified in 'projection'
apps.get = function(id, projection) {

    var projection = projection || {}

    var file = apps.files[id]
    var xml

    var app = {
        id: id
    }

    var name = path.basename(file, '.xml')
    var toks = name.split('-')
    app.packageName = toks[0]
    app.version = toks[1]

    if (projection.dom) {
        xml = fs.readFileSync(file, 'utf8')
        app.dom = cheerio.load(xml, {
            recognizeSelfClosing: true,
            xmlMode: true
        })
    }

    if (projection.xml) {
        app.xml = xml || fs.readFileSync(file, 'utf8')
    }

    return app
}

module.exports = apps