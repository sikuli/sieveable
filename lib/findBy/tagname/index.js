var _ = require('lodash'),
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
        .then(function(index){
            env.indexes.tagname = index
        })
}


function _collect_names_from_q(node, acc) {
    acc = acc || []
    if(node.name == '__' && 'attributes' in node){
        acc.push(_getCustomTagName(node.attributes))
    }
    else {
        acc.push(node.name)
    }
    if (node.children) {
        node.children.forEach(function(c) {
            _collect_names_from_q(c, acc)
        })
    }
    return acc
}

function _getCustomTagName(attributes) {
    return _.result(_.find(attributes, {name: '__name'}), 'value');
}

function find(env, query, options) {

    var tagnames = _.unique(_collect_names_from_q(query))
    return env.indexes.tagname.lookup({
        words: tagnames
    })
    .then(function(results){
        if (options && options.scope && _.isArray(options.scope)){
            results = _.intersection(results, options.scope)
        }
        return results
    })
}