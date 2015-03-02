var reader = require('./files_reader'),
    cheerio = require('cheerio'),
    _ = require('lodash');

var db = {}
db.find = function(q, cb) {
    console.log(cb);
    for(property in q){
        console.log(property + '=>' + q[property]);
    }
    reader.get(function(error, apps){
        var result = _.filter(apps, function(app){
            var $ = cheerio.load(app.xml,{
                recognizeSelfClosing: true,
                xmlMode: true
            });
            return $(q.name).length > 0;
        }
        );
        cb(null, result)
    })
}

module.exports = db
