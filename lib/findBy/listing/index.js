var Promise = require('bluebird');
var _ = require('lodash');
var fs = require('fs');
var parseString = require('xml2js');
var eyes = require('eyes');
var config = require("config");
var collectionName = config.get("dbConfig.mongo.collections")[0].collection;

var xml2js = Promise.promisifyAll(parseString);

module.exports = {
    init: init,
    find: find
};

function init(env) {
    return new Promise(function (resolve, reject) {
        resolve(env)
    })
}

function find(env, query, mongo, options) {

    // If listing query is not specified, return everything in scope.
    if (!query) {
        return Promise.resolve(options.scope);
    }
    else if (query) {
        return xml2js.parseStringAsync(query).
            then(function (queryObject) {
                return mongo.find(collectionName, queryObject, {fields: {id: 1}});
            }).then(function (cursor) {
                //TODO: limit the cursor returned results
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
                return cursor.toArrayAsync()
            }).then(function (docs) {
                return _.pluck(docs, 'id');
            })
    }
}
