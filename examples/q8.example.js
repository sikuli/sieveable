var glob = require('glob'),
    fs = require('fs'),
    q8 = require('../lib/q8');

console.time('q8');
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app;
    });

    var result = q8(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q8');
    });
});