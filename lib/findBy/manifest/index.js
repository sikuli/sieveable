const Promise = require('bluebird'),
  chalk = require('chalk'),
  apps = require('../../db/apps'),
  parse = require('../../parse'),
  log = require('../../logger'),
  _ = require('lodash'),
  domNormalMatcher = require('../dom/normal-matcher.js'),
  maxManifestResults = require('config').results.maxManifest;

exports.init = function init(env) {
  return apps
    .init('manifest')
    .then((ret) => {
      const newEnv = env;
      newEnv.ids.manifest = ret;
      return newEnv;
    });
};

exports.find = function find(env, query, options) {
  if (_.isEmpty(query)) {
    return Promise.resolve({ id: options.scope });
  }
  const manifestQuery = parse(query),
    results = _.map(options.scope, (appId, count) => {
      return env.apps.getPath(appId)
        .then((appPathsObj) => {
          const currentApp = env.apps.loadData(appPathsObj, { manifest: true }),
            result = match(manifestQuery, currentApp, currentApp.manifest);
          log.info('%d: %s %s', count, chalk.grey(currentApp.id),
              result.matched ? chalk.green('yes') : chalk.red('no'));
          if (result.matched) {
            return {
              id: currentApp.id,
              returnAttributes: result.returnAttributes
            };
          }
          return undefined;
        })
        .catch((e) => {
          log.error('Manifest Search failed while executing query %s.', query, e);
          return Promise.reject(e);
        });
    });
  return Promise.all(results).then((manifestResults) => {
    const result = _.compact(manifestResults);
    if (result.length > maxManifestResults) {
      return _.drop(result, result.length - maxManifestResults);
    }
    return result;
  });
};

function match(query, app) {
  if (app.manifest) {
    return domNormalMatcher(query, app, app.manifest);
  }
  return {};
}
