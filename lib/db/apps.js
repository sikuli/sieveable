var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
     _ = require('lodash')

var glob = Promise.promisify(require("glob").glob)

var apps = {}

apps.init = function() {

    return glob(__dirname + '/../../fixtures/ui-xml/*.xml')
        .then(function(files) {
            apps.files = files
            return apps
        })
}

// get an app by its id, with fields specified in 'projection'
apps.get = function(id, projection) {

    var projection = projection || {}

    var file = __dirname + '/../../fixtures/ui-xml/' + id + '.xml'
    var xml

    var app = {
        id: id
    }

    //var name = path.basename(file, '.xml')
    var toks = id.split('-')
    //app.packageName = toks[0]
    //app.version = toks[1]

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

    if (projection.perm) {
        app.perm = unpickle('./datasets/apac/perm/' + id + '.json')
    }

    return Promise.resolve(app)
}



function unpickle(src){
    var contents = fs.readFileSync(src, 'utf8')
    var data = []
    var JSONPickle = function(o){
        data.push(o)
    }
    eval(contents)

    var gs = _.groupBy(data, '$type')
    return {
        appData: gs['edu.colorado.permgrep.appData'][0],
        perms: gs['edu.colorado.permgrep.onePerm']
    }
}

module.exports = apps