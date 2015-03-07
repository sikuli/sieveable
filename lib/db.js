var reader = require('./files_reader'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    S = require('string');

var db = {}
db.find = function (q, cb) {
    reader.get(function (error, apps) {
        var result = _.filter(apps, function (app) {
            var $ = cheerio.load(app.xml, {
                recognizeSelfClosing: true,
                xmlMode: true
            });
            if (q.children === undefined && q.length === undefined) {
                return _find_by_a_single_tag(q, $);
            } else if ('length' in q && q.length > 1) {
                return _find_by_siblings(q, $)
            } else if (q.children.length === 1) {
                return _find_by_a_single_tag_with_n_children(q, $);
            } else if (q.children.length > 1) {
                return _find_by_a_single_tag_with_n_children_of_multiple_kinds(q, $);
            } else {
                console.error('unknown query.');
                return false;
            }
        });
        cb(null, result)
    })
}

function _find_by_a_single_tag(q, $) {
    var selector = q.name;
    if('attributes' in q){
        var properties = Object.keys(q.attributes);
        var attributes = "";
        for (var i = 0 ; i < properties.length; i ++ ){
            attributes += "[" + properties[i] + "=" + q.attributes[properties[i]] + "]";
        }
        attributes = S(attributes).replaceAll(":", "\\:").s;
        selector += attributes;
    }
    if ('min' in q) {
        $(selector).length > q.min;
    }
    else if ('max' in q) {
        $(selector).length < q.count;
    }
    else if ('count' in q) {
        $(selector).length == q.count;
    }
    return $(selector).length > 0
}

function _find_by_a_single_tag_with_n_children(q, $) {
    var childName = q.children[0].name;
    var count = q.children[0].count;
    return _.some($(q.name).toArray(), function (elem) {
        if ($(elem).children(childName).length == count) {
            return true;
        }
    });
}

function _find_by_a_single_tag_with_n_children_of_multiple_kinds(q, $) {
    var childrenNames = new Array();
    var countValues = new Array();
    q.children.forEach(function (item) {
        childrenNames.push(item.name);
        countValues.push(item.count)
    });
    return _.some($(q.name).toArray(), function (elem) {
        var found = false;
        for (var i = 0; i < childrenNames.length; i++) {
            if ($(elem).children(childrenNames[i]).length == countValues[i]) {
                found = true;
            }
        }
        return found;
    });
}

function _find_by_siblings(q, $) {
    var first = q[0].name
    return _.some($(first).toArray(), function (elem) {
        var found = false;
        for (var i = 1; i < q.length; i++) {
            if ($(elem).siblings(q[i].name).length == q[i].count) {
                found = true;
                continue;
            } else {
                found = false;
                break;
            }
        }
        if (found == true) {
            return found;
        }
    });
}

module.exports = db