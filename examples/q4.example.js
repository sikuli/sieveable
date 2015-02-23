var glob = require('glob'),
    fs = require('fs'),
    q4 = require('../lib/q4')

console.time('q4')
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    });

    var result = q4(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q4');
    });
});