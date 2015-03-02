var glob = require('glob'), 
    fs = require('fs');

module.exports = {
    get: get
}

function get(cb){
    var apps = [1,2,3]

    glob.glob('./data/ui-xml/*', function(err, files) {
        var apps = files.map(function(file) {
            var app = {
                xml: fs.readFileSync(file, 'utf8')
            }        	
            return app
        });

        cb(null, apps);
    });
}
