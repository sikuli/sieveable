var glob = require('glob'),
    fs = require('fs'),
    q7 = require('../lib/q7');

console.time('q7');
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app;
    });

    var result = q7(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q7');
    });
});