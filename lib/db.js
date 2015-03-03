var reader = require('./files_reader'),
    cheerio = require('cheerio'),
    _ = require('lodash');

var db = {}
db.find = function(q, cb) {
    reader.get(function(error, apps){
        var result = _.filter(apps, function(app){
            var $ = cheerio.load(app.xml,{
                recognizeSelfClosing: true,
                xmlMode: true
            });

            if(q.children === undefined){
                return _find_by_a_single_tag(q, $);
            } else if(q.children.length === 1){
                return _find_by_a_single_tag_with_n_children(q, $);
            }
        }
        );
        cb(null, result)
    })
}

function _find_by_a_single_tag(q, $){
    return $(q.name).length > 0
}

function _find_by_a_single_tag_with_n_children(q, $){
    var childName = q.children[0].name;
    var count = q.children[0].count;
    $(q.name).each(function(i, elem){
         if($(this).children(childName).length == count){
              return $(this).children(childName).length;
         }
    });
}

module.exports = db
