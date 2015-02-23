var glob = require('glob'),
    fs = require('fs'),
    q3 = require('../lib/q3')

console.time('q3')
glob.glob('../data/ui-xml/*', function(err, files) {
    var apps = files.map(function(file) {
        var app = {
            xml: fs.readFileSync(file, 'utf8')
        }
        return app
    });

    var result = q3(apps, function(error, result) {
        if (err) {
            throw (err);
        }
        console.log(result);
        console.timeEnd('q3');
    });
});