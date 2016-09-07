/* eslint complexity: [2, 6] */
/* eslint max-statements: [2, 15] */
'use strict';
const Promise = require('bluebird'),
  _ = require('lodash'),
  parseString = require('xml2js'),
  solr = require('../../db/solr'),
  log = require('../../logger'),
  xml2js = Promise.promisifyAll(parseString);

module.exports = { find };

function find(query, options, cursor) {
  // If listing query is not specified, return everything in scope.
  if (!query) {
    return Promise.resolve(options.scope);
  }
  const xmlQuery = `<root>${query}</root>`;
  return xml2js.parseStringAsync(xmlQuery, { explicitArray: false })
    .then((queryObject) => {
      const queryObj = getQuery(queryObject.root);
      return cursor ? solr.findListing(queryObj, options, 'id', cursor) :
       solr.findListing(queryObj, options, 'id');
    })
    .then((body) => {
      const ids = _.map(body.response.docs, 'id');
      return cursor ? { ids, cursor: body.nextCursorMark } : ids;
    })
    .catch((e) => {
      log.error('Failed to execute listing details query %s. Reason: ', query, e);
      return [];
    });
}

// Strip extra return parameters from query object
function getQuery(queryObject) {
  const query = {};
  _.forEach(queryObject, (value, key) => {
    // Extract the extra "( )" from the value
    const newValue = extractReturnParameters(value);
    if (newValue) {
      query[key] = newValue;
    }
    // Convert the value to Solr standard query parser
    if (key === 'rate' || key === 'dct') {
      query[key] = convertToSolrComparisonSyntax(value);
    }
  });
  return query;
}

// e.g. <element>(app*)</element> and <element>(*)</element>
function extractReturnParameters(value) {
  let newValue = value;
  if (value && value.trim().indexOf('(') === 0) {
    if (value.trim()[value.length - 1] === ')') {
      newValue = value.trim().substring(1, value.length - 1);
    }
  }
  return newValue;
}

// convert field value that contains >, >=, <, <= to Solr's field comparison syntax.
function convertToSolrComparisonSyntax(value) {
  if (value === undefined) {
    log.error('Listing query field has no value.');
    return undefined;
  }
  if (value.indexOf('$gte:') !== -1) {
    const val = value.split('gte:')[1].trim();
    return `[${val} TO * ]`;
  }
  else if (value.indexOf('$gt:') !== -1) {
    const val = Number(value.split('gt:')[1].trim());
    return `{${val} TO * }`;
  }
  else if (value.indexOf('$lte:') !== -1) {
    const val = value.split('lte:')[1].trim();
    return `[ * TO ${val}]`;
  }
  else if (value.indexOf('$lt:') !== -1) {
    const val = Number(value.split('$lt:')[1].trim());
    return `{ * TO ${val} }`;
  }
  return value;
}
