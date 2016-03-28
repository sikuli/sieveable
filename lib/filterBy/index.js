const Promise = require('bluebird'),
  _ = require('lodash'),
  filterByLatest = require('./latest-filter.js'),
  filterByPackage = require('./package-filter.js');

module.exports = function filter(query, options) {
  'use strict';
  let latestFilter = false,
    packageName;

  _.forEach(query.match.props, (prop) => {
    if (prop.name === 'latest' && prop.value === true) {
      latestFilter = true;
    }
    else if (prop.name === 'package' && prop.value.length > 1) {
      packageName = prop.value;
    }
  });
  if (latestFilter && packageName) {
    return filterByPackage(packageName, query, options)
      .then((ids) => {
        return filterByLatest({ scope: ids });
      });
  }
  else if (packageName) {
    return filterByPackage(packageName, query, options);
  }
  if (latestFilter) {
    return filterByLatest(options);
  }
  return Promise.resolve(options.scope);
};
