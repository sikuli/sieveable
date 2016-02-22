'use strict';
const log = require('../logger'),
  _ = require('lodash'),
  Promise = require('bluebird');

module.exports = function filter(env, matchElements, options) {
  const matchByLatest = _.some(matchElements, (element) => {
    if (element.toLowerCase().indexOf('app.latest') > -1) {
      return true;
    }
  });
  // If no "match by latest" filter condition is given, return everything in scope
  if (!matchByLatest) {
    return Promise.resolve(options.scope);
  }
  try {
    const latest = filterByLatest(options.scope);
    return Promise.resolve(latest);
  }
  catch (e) {
    log.error('Failed to apply filter by latest.', e);
    return Promise.reject(e);
  }
};

function filterByLatest(ids) {
  const apps = _.map(ids, (id) => {
      return { n: id.split('-')[0], verc: id.split('-')[1] };
    }),
    groupedAppVersions = _.groupBy(apps, 'n');
  return _.map(groupedAppVersions, (appVersion) => {
    const latest = _.max(appVersion, 'verc');
    return latest.n + '-' + latest.verc;
  });
}
