var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var apps = require('../../db/apps');
var parse = require('../../parse');
var log = require("../../logger");
var domNormalMatcher = require('../dom/normal-matcher.js');
var maxManifestResults = require('config').results.maxManifest;

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return apps
        .init("manifest")
        .then(function (ret) {
            env.apps = ret
            return env
        })
}

function find(env, query, options) {
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    var manifestQuery = parse(query);
    // array to collect results
    var results = []
    var count = 0;
    var found = 0;
    // Iterate over ids in the scope
    for (var i = 0; i < options.scope.length; i++) {
        var id = options.scope[i];
        var app = env.apps.get(id, {manifest: true})

        if (app.manifest === undefined || app.manifest === null) {
            return;
        }
        var matched = domNormalMatcher(manifestQuery, app, app.manifest)

        if (matched) {
            results.push(id)
            found++;
        }

        log.info('%d: %s %s', count, chalk.grey(id),
            matched ? chalk.green('yes') : chalk.red('no'))
        count++;

        if (found == maxManifestResults) {
            // the maximum number of UI results have been reached.
            break;
        }
    }

    return Promise.resolve(results);
}
