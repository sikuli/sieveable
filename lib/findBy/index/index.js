var _ = require('lodash');
var parse = require('../../parse');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require("request"));
var apps = require("../../db/apps");
var xmldom = require("xmldom");
var config = require("config");

module.exports = {
    find: find
};

var suffixArray = [];
var tagNames = [];

function find(env, query, queryType, options) {
    suffixArray = [];
    tagNames = [];
    // If query is not specified, return everything in scope
    if (!query) {
        return Promise.resolve(options.scope);
    }
    if (queryType === "ui") {
        _extractTags(query);
        if (suffixArray.length > 0 && tagNames.length > 0) {
            return Promise.all([getSolrRequest('uiTagCollection', suffixArray),
                getSolrRequest('uiSuffixCollection', tagNames)])
                .then(function (ids) {
                    var inter = _.intersection(ids[0], options.scope);
                    return Promise.resolve(_.intersection(ids[1], inter));
                }).catch(function () {
                    return Promise.reject(new Error("Failed to get index results from the uiTagCollection and uiSuffixCollection"));
                });
        }
        else if (suffixArray.length > 0 && tagNames.length == 0) {
            return getSolrRequest('uiSuffixCollection', suffixArray)
                .then(function (ids) {
                    return Promise.resolve(_.intersection(ids, options.scope));
                })
                .catch(function () {
                    return Promise.reject(new Error("Failed to get index results from the uiSuffixCollection"));
                });
        }
        else if (tagNames.length > 0 && suffixArray.length == 0) {
            return getSolrRequest('uiTagCollection', tagNames)
                .then(function (ids) {
                    return Promise.resolve(_.intersection(ids, options.scope));
                })
                .catch(function () {
                    return Promise.reject(new Error("Failed to get index results from the uiTagCollection"));
                });
        }
        else {
            return Promise.reject(new Error("IndexSearchError: No tags are found for the given query"));
        }
    }
    else if (queryType === "manifest") {
        _extractTags(query);
        if (tagNames.length == 0 && suffixArray.length > 0) {
            _.forEach(suffixArray, function (item) {
                tagNames.push(item.split('$'));
            })
            tagNames = _.flattenDeep(tagNames);
            tagNames = _.unique(tagNames);
        }
        return getSolrRequest('manifestCollection', tagNames)
            .then(function (ids) {
                return Promise.resolve(_.intersection(ids, options.scope));
            }).catch(function (e) {
                return Promise.reject(new Error("Failed to get index results from the manifestCollection"));
            });
    }
    else {
        return Promise.reject(new Error("Unknown index type"));
    }
}

function getSolrRequest(collectionName, arrValues) {
    var solrConfig = config.get("dbConfig.solr");
    var reqURL = "http://" + solrConfig.host + ":" + solrConfig.port +
        "/solr/" + solrConfig[collectionName] + "/query";
    var terms = _.map(arrValues, function (val) {
        if (val.indexOf("*") > -1 &&
            (val.indexOf("*$") == -1) && (val.indexOf("$*") == -1)) {
            return _escapeSpecialCharacters(val);
        }
        return '"' + _escapeSpecialCharacters(val) + '"';
    });
    var _text_ = terms.join(" && ");
    var reqObj = {
        url: reqURL,
        qs: {q: "_text_:" + _text_, wt: "json", rows: 1000000000, fl: 'id'}
    };

    function clientError(e) {
        return e.code >= 400 && e.code < 500;
    }

    return request.getAsync(reqObj)
        .get(1)
        .then(function (body) {
            var docs = JSON.parse(body).response.docs;
            return Promise.resolve(_.pluck(docs, 'id'));
        })
        .catch(clientError, function (e) {
            log.error(e);
            return Promise.reject(e);
        });
}

function _extractTags(queryText) {
    var doc = new xmldom.DOMParser().parseFromString(queryText,
        "text/xml");
    var rootElementList = _.filter(doc.childNodes, function (child) {
        return child.nodeType === 1;
    });
    // Add xml tags that have star e.g.,(<com.myview.* />, <com.myview.* attr="2"/>)
    _.forEach(doc.childNodes, function (child) {
        if (child.nodeType === 3 && child.data.indexOf('*') > -1) {
            var tagWithStar = child.data.split('/>')[0];
            if (tagWithStar && tagWithStar.indexOf(" ") > -1) {
                tagNames.push(tagWithStar.split(" ")[0]);
            }
            else {
                tagNames.push(tagWithStar);
            }
        }
    });
    _.forEach(rootElementList, function (root) {
        var children = _.filter(root.childNodes, function (child) {
            return child.nodeType === 1;
        });
        if (children.length == 0) {
            addTagName(root);
        }
        _.forEach(children, function (child) {
            addChildren(child, root);
        });
    });
}

function addChildren(element, parent) {
    var parentName = parent.localName;
    var elementName = element.localName;
    if (parentName === "_") {
        parentName = "*";
    }
    if (elementName === "_") {
        elementName = "*";
    }
    if (element.hasChildNodes()) {
        suffixArray.push(parentName + "$" + elementName);
        var children = _.filter(element.childNodes, function (child) {
            return child.nodeType === 1;
        });
        _.forEach(children, function (child) {
            addChildren(child, element)
        })
    }
    else {
        suffixArray.push(parentName + "$" + elementName);
    }
}

function addTagName(element) {
    var elementName = element.localName;
    // Skip anonymous tags
    if (element.localName == "_") {
        elementName = "*";
    }
    if (element.attributes.length > 0) {
        _.forEach(element.attributes, function (attr) {
            if (attr.nodeName.indexOf("*") > -1 ||
                attr.nodeValue.indexOf("*") > -1) {
                tagNames.push(elementName + " AND " + attr.nodeName +
                    " AND " + attr.nodeValue);
            }
            else {
                tagNames.push(elementName + "(" + attr.nodeName + '="' +
                    attr.nodeValue + '")');
            }
        });
    }
    else {
        tagNames.push(elementName);
    }
}

/**
 * Escape a string that uses any of Solr's special characters except the *.
 * + - && || ! ( ) { } [ ] ^ " ~ ? : /
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with a single backslash proceeding the
 * special character.
 * @private
 */
function _escapeSpecialCharacters(str) {
    var escaped = str.replace(/([\+\-!\(\)\{}\[\]\^"~\?:\/])/g, '\\$1');
    escaped = escaped.replace("&&", "\\&&");
    escaped = escaped.replace("||", "\\||");
    return escaped;
}