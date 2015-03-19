var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio')

var glob = Promise.promisify(require("glob").glob)

module.exports = {

    init: function() {

        return glob(__dirname + '/../../data/ui-xml/*')
            .then(function(files) {

                return {
                    get: function(id) {
                        var file = files[id]
                        var xml = fs.readFileSync(file, 'utf8')
                        var dom = cheerio.load(xml, {
                            recognizeSelfClosing: true,
                            xmlMode: true
                        })
                        return {
                            id: id,
                            path: path.basename(file),
                            xml: xml,
                            dom: dom
                        }
                    }
                }

            })
    }

}