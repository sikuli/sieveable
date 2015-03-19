var Promise = require('bluebird')

module.exports = {
    init: init,
    find: find
}

function init(env){
    return new Promise(function(resolve, reject){
        resolve(env)
    })
}

function find(env, query, options) {    

    // array to collect results
    var results = []

    // TODO: some mongodb query
    // now, just take a slice to simulate the effect
    results = options.scope.slice(0,30)

    return new Promise(function(resolve, reject){
        resolve(results)
    })
}
