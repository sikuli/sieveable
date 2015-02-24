var glob = require('glob'),
    fs = require('fs'),
    q10 = require('../lib/q10')

console.time('q10')
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    });

    var result = q10(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q10');
    });
});