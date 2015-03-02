var reader = require('./files_reader'),
    cheerio = require('cheerio');

var db = {}
db.find = function(q, cb) {
    for(property in q){
        console.log(property + '=>' + q[property]);
    }
    reader.get(function(error, apps){
        apps.forEach(function(app){
            var $ = cheerio.load(app.xml,{
                recognizeSelfClosing: true,
                xmlMode: true
            });
            console.log($(q.name).length);
        });
        cb(null, 'done')
    })
}

module.exports = db
