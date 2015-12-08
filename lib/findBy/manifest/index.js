'use strict';
const Promise = require('bluebird'),
    chalk = require('chalk'),
    apps = require('../../db/apps'),
    parse = require('../../parse'),
    log = require('../../logger'),
    domNormalMatcher = require('../dom/normal-matcher.js'),
    maxManifestResults = require('config').results.maxManifest;

module.exports = {
    init: init,
    find: find
};

function init(env) {
    return apps
        .init('manifest')
        .then((ret) => {
            env.apps = ret;
            return env;
        });
}

function find(env, query, options) {
    const manifestQuery = parse(query),
        // array to collect results
        results = [];
    let count = 0,
        found = 0;
    // Iterate over ids in the scope
    for (let i = 0; i < options.scope.length; i++) {
        const id = options.scope[i],
            app = env.apps.get(id, { manifest: true });
        if (app.manifest === undefined || app.manifest === null) {
            return;
        }
        const mResult = domNormalMatcher(manifestQuery, app, app.manifest);
        if (mResult.matched) {
            results.push({
                id: id,
                returnAttributes: mResult.returnAttributes
            });
            found++;
        }
        log.info('%d: %s %s', count, chalk.grey(id),
            mResult.matched ? chalk.green('yes') : chalk.red('no'));
        count++;

        if (found === maxManifestResults) {
            // the maximum number of UI results have been reached.
            break;
        }
    }
    return Promise.resolve(results);
}
