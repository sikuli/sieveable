'use strict';
const log = require('../logger'),
  _ = require('lodash'),
  Promise = require('bluebird');

module.exports = function filter(env, matchElements, options) {
  let appIndex = -1;
  _.some(matchElements, (element, index) => {
    if (element.toLowerCase().indexOf('app.') !== -1) {
      appIndex = index;
      return true;
    }
  });
  // If no filter condition is given, return everything in scope
  if (appIndex === -1 || matchElements[appIndex].split('.')[1] === undefined) {
    return Promise.resolve(options.scope);
  }
  const condition = matchElements[appIndex].split('.')[1];
  if (condition.toLowerCase() === 'latest') {
    try {
      const latest = filterByLatest(options.scope);
      return Promise.resolve(latest);
    }
    catch (e) {
      log.error('Failed to apply filter by latest.', e);
      return Promise.reject(e);
    }
  }
};

function filterByLatest(ids) {
  const apps = _.map(ids, (id) => {
      return { n: id.split('-')[0], verc: id.split('-')[1] };
    }),
    packageGroupe = _.groupBy(apps, 'n');
  return _.map(packageGroupe, (val) => {
    const latest = _.max(val, 'verc');
    return latest.n + '-' + latest.verc;
  });
}
