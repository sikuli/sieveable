'use strict';
const Promise = require('bluebird'),
    _ = require('lodash'),
    parseString = require('xml2js'),
    config = require('config'),
    log = require('../../logger'),
    xml2js = Promise.promisifyAll(parseString),
    collectionName = config.get('dbConfig.mongo.collections')[0].collection;

module.exports = function find(env, query, mongo, options) {
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    const xmlQuery = '<root>' + query + '</root>';
    return xml2js.parseStringAsync(xmlQuery, { explicitArray: false })
        .then((queryObject) => {
            const fieldsToReturn = getReturnFields(queryObject.root);
            if (fieldsToReturn.length > 0) {
                return _find(options.scope, mongo, fieldsToReturn);
            }
            else {
                return Promise.resolve(options.scope);
            }
        });
};

function _find(ids, mongo, fields) {
    const listingResult = [],
        resultFields = {};
    _.forEach(fields, (v) => {
        resultFields[v] = 1;
    });
    return Promise.map(ids, (id) => {
        return mongo.find(collectionName, { id: id }, { fields: resultFields })
            .then((cursor) => {
                cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
                return cursor.toArrayAsync();
            })
            .then((docs) => {
                const result = { id: id, returnAttributes: {} };
                if (docs.length > 0) {
                    for (let i = 0; i < fields.length; i++) {
                        const f = '$' + (i + 1);
                        result.returnAttributes[f] = docs[0][fields[i]];
                    }
                }
                log.info('Returned listing details values for %s', id);
                listingResult.push(result);
            });
    }, {
        concurrency: 1
    })
        .then(() => {
            log.info('Returned element values from the listing details for %d apps.',
                ids.length);
            return listingResult;
        }).catch((e) => {
            log.error('Error in returnWithListing. Failed to return fieldresults.' +
                ' Reason: %s', e.message);
            return undefined;
        });
}

function getReturnFields(queryObject) {
    const fields = [];
    _.forEach(queryObject, (value, key) => {
        // If the value contains "( )", then it is a return field
        if (value && value.trim().indexOf('(') === 0 &&
            value.trim().indexOf(')') === value.length - 1) {
            fields.push(key);
        }
    });
    return fields;
}
