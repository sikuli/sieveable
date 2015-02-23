var glob = require('glob'),
    fs = require('fs'),
    q6 = require('../lib/q6');

console.time('q6');
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app;
    });

    var result = q6(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q6');
    });
});