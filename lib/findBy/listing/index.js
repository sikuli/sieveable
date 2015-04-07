var Promise = require('bluebird'),
    _ = require('lodash'),
    chalk = require('chalk'),
    fs = require('fs'),
    getConnection = require('../../db/connection'),
    using = Promise.using;

// MongoDB listing details collection fields
var listingFields = ['category', 'date_published', 'developer', 'download',
    'package', 'permissions', 'rating', 'title', 'total_permissions',
    'version_code', 'version_name']

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return new Promise(function (resolve, reject) {
        resolve(env)
    })
}

function doFind(options, env, query) {
    var results = []
    var filePath = __dirname + '/listing_details.json'
    var listingDetails = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    var qResult = _.where(listingDetails, query)
    var packages = _.pluck(qResult, 'package')
    var versions = _.pluck(qResult, 'version_code')
    // for each app ids in scope
    // find documents in MongoDB's listing details collection
    // TODO: Use the $in operator to select the documents where the value
    /*
     db.listings.find({package: {$in: ['com.whatsapp', 'com.google.android.music']},
     version_code: {$in: [1514,48364,48450]}  }, {package:1, version_code:1})
     */
    return options.scope.map(function (id) {

        var app = env.apps.get(id, {dom: false})

        var matched = _searchListings(app, packages, versions)
        if (matched) {
            results.push(id)
        }
        console.log('%d: %s %s', app.id, chalk.grey(app.packageName + '-' +
        app.version), matched ? chalk.green('yes') : chalk.red('no'))

        // search MongoDB

        return using(getConnection({
            host: 'localhost',
            db: 'apps'
        }), function (db) {
            return db.collection("listings").findOneAsync(query)
        }).then(function (doc) {
            var matched = ('length' in doc && doc.length > 0) ? true : false
            if (matched) {
                // add to the results array
                results.push(id)
            }
            console.log('%d: %s %s', app.id, chalk.grey(app.packageName + '-' +
            app.version), matched ? chalk.green('yes') : chalk.red('no'))
            return results
        });
    });
    //return results;
}

function find(env, query, mongo,options) {
    // array to collect results
    var results = []

    // If listing query is specified, filter the results
    if (query && Object.getOwnPropertyNames(query).length > 0) {
        if (_validateQuery(query)) {
            results = doFind(options, env, query)
        }
        else {
            console.error('Invalid listing details query. Allowed fields are: '
            + listingFields.join(','))
        }
    }
    else {
        // If listing query is not specified, return everything in scope.
        results = options.scope
    }

    return new Promise(function (resolve, reject) {
        resolve(results)
    })
}

function _validateQuery(q) {
    var questionFields = Object.getOwnPropertyNames(q)
    return _.every(questionFields, function (elem) {
        return _.indexOf(listingFields, elem) != -1
    });
}

function _searchListings(app, packages, versions) {
    //TODO: Fix
    return _.some(packages, function (n) {
            return n === app['packageName']
        }) &&
        _.some(versions, function (ver) {
            return ver.toString() === app['version']
        })
}
