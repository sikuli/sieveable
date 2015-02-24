var glob = require('glob'),
    fs = require('fs'),
    q9 = require('../lib/q9')

console.time('q9')
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    });

    var result = q9(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q9');
    });
});