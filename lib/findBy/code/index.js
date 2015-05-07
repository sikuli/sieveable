var config = require('config');
var _ = require('lodash');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require("request"));
var parse = require('../../parse');

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return new Promise(function (resolve, reject) {
        resolve(env)
    })
}

function getSmaliQuery(query) {
    var queryObj = parse(query);
    var lines = [];
    _.forEach(queryObj, function (v) {
        var line = '';
        _.forEach(v.attributes, function (attrib) {
            if (attrib.name.toLowerCase() == 'class') {
                line += 'L' + attrib.value.replace(/\./g, '/');
            }
            else if (attrib.name.toLowerCase() == 'method') {
                line += ';->' + attrib.value;
            }
        });
        lines.push(line);
    });
    return lines;
}

function find(env, query, options) {
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    var codeQueries = getSmaliQuery(query);
    var queryValue = '_text_:"' + codeQueries.join('" AND _text_:"') + '"'
    // search the code collection in Solr
    function clientError(e) {
        return e.code >= 400 && e.code < 500;
    }

    var solrConfig = config.get("dbConfig.solr");
    var reqURL = "http://" + solrConfig.host + ":" + solrConfig.port +
        "/solr/" + solrConfig.collection + "/query";

    var queryParameters = {q: queryValue, wt: "json"}

    var results = request.getAsync({url: reqURL, qs: queryParameters})
        .get(1)
        .then(function (body) {
            var docs = JSON.parse(body).response.docs;
            return _.pluck(docs, 'id');
        }).catch(clientError, function (e) {
            console.error(e.message);
        });
    return Promise.resolve(results);
}