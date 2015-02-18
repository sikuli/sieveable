var glob = require('glob')
var fs = require('fs')

var q1 = require('./lib/q1')
// var q2 = require('./lib/q2')
//var q3 = require('./lib/q3')
var q5 = require('./lib/q5')

glob.glob('./data/ui-xml/*', function(err, files) {

    var apps = files.map(function(file) {

        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }

        return app
    })

    // var result = q1(apps)
<<<<<<< HEAD
    var result = q5(apps, 10)
=======
    var n = process.argv.slice(2)[0] || 18
    var result = q5(apps, n)
>>>>>>> a39c5e8c9f082a76d97702cadbc59cae69461637
    console.log(result)

})