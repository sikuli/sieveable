var Promise = require('bluebird')
var Item = require('../../item')
var _ = require('lodash')
var glob = require('glob')
var fs = Promise.promisifyAll(require('fs'))

module.exports = {
    init: init,
    find: find
}

function init(env){
    return Promise.resolve(env)
}

function find(env, query, options) {

    var name = query.name

    return new Promise(function(resolve, reject) {

        // TODO: get a list of items from a precomputed list
        var path = './datasets/' + name + '/perm/*.json'

        glob.glob(path, function(err, results){

            var allItems = results.map(function(r){
                var id = r.match(/perm\/(.*).json/)[1]
                return new Item(id)
            })

            resolve(allItems)
        })
    })
}
