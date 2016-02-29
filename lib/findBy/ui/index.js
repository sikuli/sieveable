const Promise = require('bluebird'),
  chalk = require('chalk'),
  apps = require('../../db/apps'),
  parse = require('../../parse'),
  log = require('../../logger'),
  _ = require('lodash'),
  domNormalMatcher = require('../dom/normal-matcher.js'),
  domStrictMatcher = require('../dom/strict-matcher.js');

exports.init = function init(env) {
  return apps
    .init('ui')
    .then((ret) => {
      const newEnv = env;
      newEnv.ids.ui = ret;
      return newEnv;
    });
};

exports.find = function find(env, query, options) {
  if (_.isEmpty(query)) {
    return Promise.resolve({ id: options.scope });
  }
  const uiQuery = parse(query),
  // Get all file paths
    results = _.map(options.scope, (appId, count) => {
      return env.apps.getPath(appId)
      .then((appPathObj) => {
        const currentApp = env.apps.loadData(appPathObj, { dom: true }),
          result = match(options.mode, currentApp, uiQuery);
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
        if (e.type === 'NotFoundError') {
          log.warn('UI file for %s was not found.', appId);
          return undefined;
        }
        log.error('UI Search failed while executing query %s.', query, e);
        return Promise.reject(e);
      });
    });
  return Promise.all(results).then((uiResults) => {
    return _.compact(uiResults);
  });
};

function match(mode, app, query) {
  if (!app || !app.dom) {
    return {};
  }
  if (mode === 'strict') {
    return domStrictMatcher(query, app, app.dom);
  }
  return domNormalMatcher(query, app, app.dom);
}
