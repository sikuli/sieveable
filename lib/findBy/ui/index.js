var Promise = require('bluebird');
var chalk = require('chalk');
var apps = require('../../db/apps');
var parse = require('../../parse');
var log = require('../../logger');
var domNormalMatcher = require('../dom/normal-matcher.js');
var domStrictMatcher = require('../dom/strict-matcher.js');
var maxUIResults = require('config')['results']['maxUI'];

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return apps
        .init("ui")
        .then(function (ret) {
            env.apps = ret
            return env
        })
}

function find(env, query, options) {
    var uiQuery = parse(query);
    // array to collect results
    var results = [];
    var count = 0;
    var found = 0;
    // Iterate over ids in the scope
    for (var i = 0; i < options.scope.length; i++) {
        var id = options.scope[i];
        var app = env.apps.get(id, {dom: true});

        if (app.dom === undefined || app.dom === null) {
            return;
        }
        var mResult = {};
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
            mResult.matched ? chalk.green('yes') : chalk.red('no'))
        count++;

        if (found == maxUIResults) {
            // the maximum number of UI results have been reached.
            break;
        }
    }
    return new Promise.resolve(results);
}


