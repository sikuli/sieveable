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


            if (q.children === undefined){
                return _find_by_a_single_tag(q, $);
            } else {
                return _find_by_a_single_tag_with_a_child(q, $);
            }

            
        }
        );
        cb(null, result)
    })
}

function _find_by_a_single_tag(q, $){
    return $(q.name).length > 0
}

function _find_by_a_single_tag_with_a_child(q, $){
    var query = q.name + ' > ' + q.children[0].name;
    return $(query).length > 0
}

module.exports = db
