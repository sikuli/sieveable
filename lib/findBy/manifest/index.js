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

    // TODO: some cheerio/JQuery query here, now just return the everything in scope
    results = options.scope

    return new Promise(function(resolve, reject){
        resolve(results)
    })
}