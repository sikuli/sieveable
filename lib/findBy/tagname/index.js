var _ = require('lodash'),
    parse = require('../../parse'),
    Promise = require('bluebird')

module.exports = {
    find: find,
    init: init
}

var searchIndex = require('./searchIndex')

//
// run time
//
function init(env) {
    env.indexes = env.indexes || {}
    return searchIndex
        .load('indexes/tagname/index.json')
        .then(function (index) {
            env.indexes.tagname = index
        })
}


function _collect_names_from_q(node, acc) {
    acc = acc || []
    // ignore special node names
    if (node.name != '_') {
        acc.push(node.name)
    }
    if (node.children) {
        node.children.forEach(function (c) {
            _collect_names_from_q(c, acc)
        })
    }
    return acc
}

function find(env, query, options) {
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    var uiQuery = parse(query)
    var tagNames = _.unique(_collect_names_from_q(uiQuery))
    return env.indexes.tagname.lookup({
        words: tagNames
    }).then(function (results) {
        if (options && options.scope && _.isArray(options.scope)) {
            results = _.intersection(results, options.scope)
        }
        return results
    })
}