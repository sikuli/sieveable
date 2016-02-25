const Promise = require('bluebird'),
  log = require('../../logger'),
  _ = require('lodash');


function getQueryLevels(query) {
  const queryLevels = [];
  if (query.code) {
    queryLevels.push('code');
  }
  if (query.ui) {
    queryLevels.push('ui');
  }
  if (query.listing) {
    queryLevels.push('listing');
  }
  if (query.manifest) {
    queryLevels.push('manifest');
  }
  return queryLevels;
}

exports.init = function init(env) {
  return Promise.resolve(env);
};

/*
 * @return [ids] Returns the ids of apps resulting from the intersection of all the
 * sets that are related to the given query parts.
 */
exports.find = function find(env, query) {
  const keys = getQueryLevels(query);
  if (keys.length < 1) {
    log.error('Unable to get dataset ids for the given query ', query);
    return Promise.reject(new Error('Unable to get dataset ids for the given query'));
  }
  let result = env.ids[keys[0]];
  _.forEach(keys, (k, i) => {
    if (i !== 0) {
      result = _.intersection(result, env.ids[k]);
    }
  });
  return Promise.resolve(result);
};
