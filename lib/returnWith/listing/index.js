var Promise = require('bluebird');
var _ = require('lodash');
var parseString = require('xml2js');
var config = require("config");
var log = require('../../logger');
var xml2js = Promise.promisifyAll(parseString);

var collectionName = config.get("dbConfig.mongo.collections")[0].collection;

module.exports = function find(env, query, mongo, options) {
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    var xmlQuery = '<root>' + query + '</root>';
    return xml2js.parseStringAsync(xmlQuery, {explicitArray: false})
        .then(function (queryObject) {
            var fieldsToReturn = getReturnFields(queryObject.root);
            if (fieldsToReturn.length > 0) {
                return _find(options, mongo, fieldsToReturn);
            }
            else {
                return options;
            }
        }).then(function (optionsWithResults) {
            return Promise.resolve(optionsWithResults);
        })
}

function _find(options, mongo, fields) {
    var optionsWithResult = options;
    optionsWithResult.listingResult = [];
    var resultFields = {};
    _.forEach(fields, function (v) {
        resultFields[v] = 1;
    });
    return Promise.map(optionsWithResult.scope, function (id) {
        return mongo.find(collectionName, {id: id}, {fields: resultFields})
            .then(function (cursor) {
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
                return cursor.toArrayAsync();
            })
            .then(function (docs) {
                var result = {id: id};
                for (var i = 0; i < fields.length; i++) {
                    var f = "$" + (i + 1);
                    result[f] = docs[0][fields[i]];
                }
                return result;
            }).then(function (result) {
                log.debug("Returned listing details values for %s", id);
                optionsWithResult.listingResult.push(result);
            })
    }, {
        concurrency: 1
    })
        .then(function () {
            log.debug("Returned element values from the listing details for %d apps.",
                options.scope.length);
            return optionsWithResult;
        }).catch(function (e) {
            log.error("Error in returnWithListing. Failed to return fieldresults." +
                " Reaso %s", e.message);
            return undefined;
        });
}

function getReturnFields(queryObject) {
    var fields = [];
    _.forEach(queryObject, function (value, key) {
        // If the value contains "( )", then it is a return field
        if (value && value.trim().indexOf("(") === 0 &&
            value.trim().indexOf(")") === value.length - 1) {
            fields.push(key);
        }
    })
    return fields;
}