var reader = require('./files_reader'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    S = require('string'),
    Promise = require('bluebird')

var indexer = require('./indexer'),
    index = require('../build/index.json')

var db = {}

function get_handler(q) {
    if (q.children === undefined && q.length === undefined) {
        return _find_by_a_single_tag
    } else if ('length' in q && q.length > 1) {
        func = _find_by_siblings
    } else if (q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children
    } else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_kinds
    } else {
        console.error('unknown query.');
        return function() {
            return false
        }
    }
}

// take an 'app' and return an object of things we care
function toResult($) {
    return {
        app: $('App').attr('name'),
        version: $('App').attr('version_code')
    }
}

function collect_names(node, acc) {
    acc = acc || []
    acc.push(node.name)
    if (node.children) {
        node.children.forEach(function(c) {
            collect_names(c, acc)
        })
    }
    return acc
}

// db.init = function(){

// }

db.find = function(q) {

    return Promise.props({
        index: indexer.load('build/index.json'),
        apps: apps.init()
    }).then(function(result) {
        console.log(result.index)
    })

    // index: indexer.load()
    // apps.init()
    //     .then(function(apps){


    //     })
}

db.find1 = function(q, cb) {

    var tagnames = _.unique(collect_names(q))
        // console.log(tagnames)

    // search for candidates from the index and get their ids
    var ids = indexer.search(index, {
        words: tagnames
    })
    console.log("candidates:", ids.join(','))

    reader.get(function(error, apps) {

        var count = 0
        var limit = 10
        var results = []

        ids.forEach(function(id) {

            var app = apps.get(id)

            if (count < limit) {

                var $ = cheerio.load(app.xml, {
                    recognizeSelfClosing: true,
                    xmlMode: true
                })

                var handler = get_handler(q)
                var ret = handler(q, $)
                if (ret) {
                    count = count + 1
                    var result = toResult($)
                    console.log(result)
                    results.push(result)
                }

            } else {

                return false
            }

        })

        cb(null, results)
    })
}

function _find_by_a_single_tag(q, $) {
    var selector = q.name;
    if ('attributes' in q) {
        var properties = Object.keys(q.attributes);
        var attributes = "";
        for (var i = 0; i < properties.length; i++) {
            attributes += "[" + properties[i] + "=" + q.attributes[properties[i]] + "]";
        }
        attributes = S(attributes).replaceAll(":", "\\:").s;
        selector += attributes;
    }
    if ('min' in q) {
        $(selector).length > q.min;
    } else if ('max' in q) {
        $(selector).length < q.count;
    } else if ('count' in q) {
        $(selector).length == q.count;
    }
    return $(selector).length > 0
}

function _find_by_a_single_tag_with_n_children(q, $) {
    var childName = q.children[0].name;
    var count = q.children[0].count;
    return _.some($(q.name).toArray(), function(elem) {
        if ($(elem).children(childName).length == count) {
            return true;
        }
    });
}

function _find_by_a_single_tag_with_n_children_of_multiple_kinds(q, $) {
    var childrenNames = new Array();
    var countValues = new Array();
    q.children.forEach(function(item) {
        childrenNames.push(item.name);
        countValues.push(item.count)
    });
    return _.some($(q.name).toArray(), function(elem) {
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
    return _.some($(first).toArray(), function(elem) {
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