const log = require('../logger'),
  _ = require('lodash'),
  Promise = require('bluebird');

module.exports = function filter(options) {
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
  return _.map(groupedAppVersions, (appVersion, packageName) => {
    const versions = _.map(appVersion, (app) => {
        return _.toInteger(app.verc);
      }),
      latestVer = _.max(versions);
    return `${packageName}-${latestVer}`;
  });
}
