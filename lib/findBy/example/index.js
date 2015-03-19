var _ = require('lodash'),
    Promise = require('bluebird'),
    chalk = require('chalk'),
    apps = require('../../db/apps')

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return apps
        .init()
        .then(function(ret) {
            env.apps = ret
            return env
        })
}

function find(env, query, options) {

    // array to collect results
    var results = []

    // for each app ids in scope
    options.scope.forEach(function(id) {

        var app = env.apps.get(id, {dom: true})

        var matcher = _lookup_matcher(query)

        // apply the matcher to 'app' to see if it maches
        var matched = matcher(query, app)

        // if so
        if (matched) {
            // add to the results array
            results.push(id)
        }

        console.log('%d: %s %s', app.id, chalk.grey(app.packageName + '-' + app.version), matched ? chalk.green('yes') : chalk.red('no'))

    })

    return new Promise(function(resolve, reject) {
            resolve(results)
        })        
}

//
// Matchers
//

// analyze the pattern of the given query and lookup a matcher to process the query 
function _lookup_matcher(q) {

    if (q.children.length === 1)
        return _single_tag_with_n_children

}

function _single_tag_with_n_children(q, app) {

    var $ = app.dom
    var childName = q.children[0].name;
    var count = q.children[0].count;
    return _.some($(q.name).toArray(), function(elem) {
        if ($(elem).children(childName).length == count) {
            return true;
        }
    })
}