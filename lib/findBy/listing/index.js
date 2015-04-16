var Promise = require('bluebird'),
    _ = require('lodash'),
    chalk = require('chalk'),
    fs = require('fs'),
    getConnection = require('../../db/connection'),
    parseString = require('xml2js');

var xml2js = Promise.promisifyAll(parseString);


module.exports = {
    init: init,
    find: find
}

function init(env) {
    return new Promise(function (resolve, reject) {
        resolve(env)
    })
}

function find(env, query, mongo, options) {

    // array to collect results
    var results = []

    // If listing query is specified, filter the results
    if (query) {
        return xml2js.parseStringAsync(query).
            then(function (queryObject) {
                return mongo.find('listings', queryObject, {fields: {id: 1}});
            }).then(function (cursor) {
                //TODO: limit the cursor returned results
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor)
                return cursor.toArrayAsync()
            }).then(function (docs) {
                return _.pluck(docs, 'id');
            })
    }
    else {
        // If listing query is not specified, return everything in scope.
        //results = options.scope

        var results = mongo.find('listings', {}, {fields: {id: 1}})
            .then(function (cursor) {
                //TODO: limit the cursor returned results
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor)
                return cursor.toArrayAsync()
            }).then(function (docs) {
                console.log(docs);
                return _.pluck(docs, 'id');;
            })

        return Promise.resolve(results);

    }
}
