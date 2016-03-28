const Promise = require('bluebird'),
  _ = require('lodash'),
  parseString = require('xml2js'),
  log = require('../../logger'),
  solr = require('../../db/solr'),
  xml2js = Promise.promisifyAll(parseString);

module.exports = function find(query, options) {
  // If query is not specified, return everything in scope
  if (!query) {
    return Promise.resolve(options.scope);
  }
  const xmlQuery = `<root>${query}</root>`;
  return xml2js.parseStringAsync(xmlQuery, { explicitArray: false })
    .then((queryObject) => {
      const fieldsToReturn = getReturnFields(queryObject.root);
      if (fieldsToReturn.length > 0) {
        return findReturnFields(options.scope, fieldsToReturn);
      }
      return Promise.resolve(options.scope);
    });
};

function findReturnFields(ids, fields) {
  const listingResult = [],
    fl = fields.join(',');
  return Promise.map(ids, (id) => {
    return solr.findListing({ id }, {}, fl, undefined)
        .then((resBody) => {
          const docs = resBody.response.docs,
            result = {
              id,
              returnAttributes: {}
            };
          if (docs.length > 0) {
            _.forEach(fields, (val, i) => {
              const f = `$${(i + 1)}`;
              result.returnAttributes[f] = arrayToString(docs[0][fields[i]]);
            });
          }
          log.debug('Returned listing details values for %s', id);
          listingResult.push(result);
        });
  },
    { concurrency: 1 })
    .then(() => {
      log.info('Returned element values from the listing ' +
        'details for %d apps.', ids.length);
      return listingResult;
    })
    .catch((e) => {
      log.error('Error in returnWithListing. Failed to return ' +
        'field results. Reason: %s', e.message);
      return undefined;
    });
}

function getReturnFields(queryObject) {
  const fields = [];
  _.forEach(queryObject, (value, key) => {
    // If the value contains "( )", then it is a return field
    if (value && value.trim()
      .indexOf('(') === 0 &&
      value.trim()
      .indexOf(')') === value.length - 1) {
      fields.push(key);
    }
  });
  return fields;
}

// Solr returns an array for fields indexed as text_general
function arrayToString(value) {
  if (_.isArray(value)) {
    return value.toString();
  }
  return value;
}
