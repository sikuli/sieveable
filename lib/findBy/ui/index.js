'use strict';
const Promise = require('bluebird'),
    chalk = require('chalk'),
    apps = require('../../db/apps'),
    parse = require('../../parse'),
    log = require('../../logger'),
    domNormalMatcher = require('../dom/normal-matcher.js'),
    domStrictMatcher = require('../dom/strict-matcher.js'),
    maxUIResults = require('config').results.maxUI;

exports.init = function init(env) {
    return apps
        .init('ui')
        .then((ret) => {
            env.apps = ret;
            return env;
        });
};

exports.find = function find(env, query, options) {
    const uiQuery = parse(query),
        // array to collect results
        results = [];
    let count = 0,
        found = 0;
    // Iterate over ids in the scope
    for (let i = 0; i < options.scope.length; i++) {
        const id = options.scope[i],
            app = env.apps.get(id, { dom: true });
        if (app.dom === undefined || app.dom === null) {
            return;
        }
        let mResult = {};
        if (options.mode === 'strict') {
            mResult = domStrictMatcher(uiQuery, app, app.dom);
        }
        else {
            mResult = domNormalMatcher(uiQuery, app, app.dom);
        }
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

        if (found === maxUIResults) {
            // the maximum number of UI results have been reached.
            break;
        }
    }
    return new Promise.resolve(results);
};
