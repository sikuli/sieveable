var glob = require('glob'),
    fs = require('fs'),
    q5 = require('../lib/q5');

var n = process.argv.slice(2)[0] || 3

console.time('q5')
glob.glob('../data/ui-xml/*', function(err, files) {

    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    })
    var result = q5(apps, null,'Button', n);
    console.log(result)
    console.timeEnd('q5')

})