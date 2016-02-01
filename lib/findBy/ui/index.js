'use strict';
const Promise = require('bluebird'),
  chalk = require('chalk'),
  apps = require('../../db/apps'),
  parse = require('../../parse'),
  log = require('../../logger'),
  _ = require('lodash'),
  domNormalMatcher = require('../dom/normal-matcher.js'),
  domStrictMatcher = require('../dom/strict-matcher.js'),
  maxUIResults = require('config')
  .results.maxUI;

exports.init = function init(env) {
  return apps
    .init('ui')
    .then((ret) => {
      env.ids.ui = ret;
      return env;
    });
};

exports.find = function find(env, query, options) {
  // Get all file paths
  const filePaths = _.map(options.scope, (scope) => {
      return env.apps.getPath(scope);
    }),
    uiQuery = parse(query),
    // array to collect results
    results = [];
  let count = 0,
    found = 0;
  // TODO: .settle is deprecated. Replace it wit .reflect
  return Promise.settle(filePaths)
    .then((promises) => {
      for (let i = 0; i < promises.length; i++) {
        if (promises[i].isFulfilled()) {
          const appPathsObj = promises[i].value(),
            currentApp = env.apps.loadData(appPathsObj, {
              dom: true
            });
          if (currentApp.dom === undefined || currentApp.dom === null) {
            continue;
          }
          let mResult = {};
          if (options.mode === 'strict') {
            mResult = domStrictMatcher(uiQuery, currentApp, currentApp.dom);
          }
          else {
            mResult = domNormalMatcher(uiQuery, currentApp, currentApp.dom);
          }
          if (mResult.matched) {
            results.push({
              id: currentApp.id,
              returnAttributes: mResult.returnAttributes
            });
            found++;
          }
          log.info('%d: %s %s', count, chalk.grey(currentApp.id),
            mResult.matched ? chalk.green('yes') : chalk.red('no'));
          count++;
          if (found === maxUIResults) {
            // the maximum number of UI results have been reached.
            break;
          }
        }
        else if (promises[i].isRejected()) {
          continue;
        }
      }
      return Promise.resolve(results);
    })
    .catch((e) => {
      log.error('UI Search failed while executing query %s.', query, e);
      return Promise.reject(e);
    });
};
