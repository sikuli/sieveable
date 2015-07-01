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
        var xmlQuery = '<root>' + query + '</root>'
        return xml2js.parseStringAsync(xmlQuery, {explicitArray:false}).
            then(function (queryObject) {
                var query = getQuery(queryObject.root);
                return mongo.find(collectionName, query, {fields: {id: 1}});
            }).then(function (cursor) {
                //TODO: limit the cursor returned results
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
                return cursor.toArrayAsync()
            }).then(function (docs) {
                return _.pluck(docs, 'id');
            })
    }
}

function getQuery(queryObject) {
    //console.log("QueryObject: " + JSON.stringify(queryObject));
    var fullTextFields = ['listing-details', 'new', 'desc'];
    var query = {};
    _.forEach(queryObject, function (value, key) {
        if (fullTextFields.indexOf(key) > -1) {
            query['$text'] = {$search: value};
        }
        else {
            query[key] = value;
        }
    })
    return query;
}
