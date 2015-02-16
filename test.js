var glob = require('glob')
var fs = require('fs')

var q1 = require('./lib/q1')
// var q2 = require('./lib/q2')
// var q3 = require('./lib/q3')
// var q4 = require('./lib/q4')

glob.glob('./data/ui-xml/*', function(err, files) {

    var apps = files.map(function(file) {

        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }

        return app
    })

    var result = q1(apps)
    console.log(result)

})