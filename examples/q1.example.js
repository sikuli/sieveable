var glob = require('glob'),
    fs = require('fs'),
    q1 = require('../lib/q1')

console.time('q1')
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    });

    var result = q1(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q1');
    });
});