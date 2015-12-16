'use strict';
const Promise = require('bluebird'),
    _ = require('lodash'),
    parseString = require('xml2js'),
    solr = require('../../db/solr'),
    xml2js = Promise.promisifyAll(parseString);

module.exports = {
    init: init,
    find: find
};

function init(env) {
    return new Promise((resolve, reject) => {
        resolve(env);
    });
}

function find(env, query, options) {
    // If listing query is not specified, return everything in scope.
    if (!query) {
        return Promise.resolve(options.scope);
    }
    else if (query) {
        const xmlQuery = '<root>' + query + '</root>';
        return xml2js.parseStringAsync(xmlQuery, { explicitArray: false }).
            then((queryObject) => {
                const queryObj = getQuery(queryObject.root);
                return solr.findListing(queryObj, 'id');
            }).then((docs) => {
                return _.pluck(docs, 'id');
            });
    }
}

// Strip extra return parameters from query object
function getQuery(queryObject) {
    const query = {};
    _.forEach(queryObject, (value, key) => {
        // Extract the extra "( )" from the value
        const newValue = _ExtractReturnParameters(value);
        if (newValue) {
            query[key] = value;
        }
    });
    return query;
}

// e.g. <element>(app*)</element> and <element>(*)</element>
function _ExtractReturnParameters(value) {
    let newValue = value;
    if (value && value.trim().indexOf('(') === 0) {
        if (value.trim()[value.length - 1] === ')') {
            newValue = value.trim().substring(1, value.length - 1);
        }
    }
    if (newValue === '*') {
        return null;
    }
    return newValue;
}
