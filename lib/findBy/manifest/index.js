var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var apps = require('../../db/apps');
var parse = require('../../parse');
var log = require("../../logger");
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

        var matcher = _lookup_matcher(manifestQuery)

        // apply the matcher to 'app' to see if it maches
        var matched = matcher(manifestQuery, app)

        // if so
        if (matched) {
            // add to the results array
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

// analyze the pattern of the given query and lookup a matcher to process the query
function _lookup_matcher(q) {
    if (q.children === undefined && q.count === 1) {
        return _find_by_a_single_tag
    }
    else if (q.children === undefined && q.count > 1) {
        return _find_by_siblings
    }
    else if (q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children_of_one_tag
    }
    else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_tags
    }
    else {
        log.error('Unrecognized query.');
        return function () {
            return false
        }
    }

}

function _find_by_a_single_tag(q, app) {
    var $ = app.manifest
    var selector = _get_element_name(q)

    // find a custom tag like: <com.whatsapp.*/>
    if (selector.indexOf('*') != -1) {
        return _.filter($('*'), function (val) {
            var allAttributesFound = true;
            if (q.attribs.length > 0) {
                allAttributesFound = _.forEach(otherAttributes, function (attribute) {
                    if (val.attribs[attribute.name] != attribute.value) return false;
                })
                return _.startsWith(val.name, selector.split('*')[0]) && allAttributesFound == true
            }
            return _.startsWith(val.name, selector.split('*')[0])
        });
    }
    if ('attributes' in q) {
        selector += _getAttributeSelectors(q.attributes)
    }
    if ('min' in q) {
        $(selector).length > q.min;
    } else if ('max' in q) {
        $(selector).length < q.count;
    } else if ('exactly' in q) {
        $(selector).length == q.exactly;
    }
    return $(selector).length >= q.count
}

function _find_by_a_single_tag_with_n_children_of_one_tag(q, app) {
    var $ = app.manifest || app
    var selector = _get_element_name(q)
    var childName = _get_child_name(q.children[0])
    var childCount = q.children[0].count
    var result
    if (typeof $ === 'function') {
        // Find each selector that is nth in relation to its sibling selector with the same element name.
        result = (childName === '*') ? $(selector + ' > ' + childName) :
            $(selector + ' > ' + childName + ':nth-of-type(' + childCount + ')')
        return result.length == 1;
    }
    else {
        result = $.children(childName);
    }
    if ('children' in q.children[0] && result.length >= childCount) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q.children[0], result)
    }
    return result.length >= childCount
}

function _find_by_siblings(q, app) {
    var $ = app.manifest
    var selector = _get_element_name(q)
    var result = $(selector + ':nth-of-type(' + q.count + ')')
    return result.length > 0
}

function _find_by_a_single_tag_with_n_children_of_multiple_tags(q, app) {
    // Find the children of the single tag and count their children
    // as siblings of each other.
    // Example: $('manifest').children('activity ~ uses-permission')
    var $ = app.manifest;
    var selector = _get_element_name(q);
    var childrenNames = new Array();
    _.forEach(q.children, function (child) {
        var fullChildName = _get_child_name(child) + " ";
        childrenNames.push(_.repeat(fullChildName + " ~ ", child.count));
    });
    // Join the array and remove the last four characters for " ~ "
    var querySiblings = childrenNames.join('').slice(0, -4);
    return $(selector).children(querySiblings).length >= 1
}

function _get_element_name(element) {
    var selector = element.name
    if (selector == '_') {
        selector = '*'
    }
    selector = _escapeSpecialCharacters(selector)
    if ('attributes' in element) {
        var actualAttributes = _filterExtraAttributes(element.attributes)
        selector += _getAttributeSelectors(actualAttributes)
    }
    return selector
}

function _getAttributeSelectors(attributes) {
    var attributesSelector = ''
    _.forEach(attributes, function (attrib) {
        var idx = attrib['value'].indexOf('*');
        // Attribute value equals to a value
        if (idx == -1) {
            var attribText = '[' + _escapeSpecialCharacters(attrib.name) +
                '="' + _escapeSpecialCharacters(attrib.value) + '"]';
            attributesSelector += attribText
        }
        // Attribute value starts with a value
        else if (idx == attrib['value'].length - 1) {
            var attribText = '[' + _escapeSpecialCharacters(attrib.name)
                + '^="' + _escapeSpecialCharacters(attrib.value.split('*')[0]) + '"]';
            attributesSelector += attribText
        }
        // Attribute value ends with a value
        else if (idx == 0) {
            var attribText = '[' + _escapeSpecialCharacters(attrib.name) +
                '$="' + _escapeSpecialCharacters(attrib.value.split('*')[1]) + '"]';
            attributesSelector += attribText
        }
    })
    return attributesSelector;
}


function _filterExtraAttributes(attributes) {
    return _.filter(attributes, function (attrib) {
        return attrib.name != '__name'
    })
}

function _get_child_name(child) {
    var childName = child.name
    if (childName == '_') {
        childName = '*'
    }
    if ('attributes' in child) {
        var actualAttributes = _filterExtraAttributes(child.attributes)
        childName += _getAttributeSelectors(actualAttributes)
    }
    if (childName != '*') {
        childName = _escapeSpecialCharacters(childName)
    }
    return childName;

}
/**
 * Escape names that use any of JQuery meta-characters as a literal part of a name.
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with with two backslashes replacing the
 * JQuery's special meta-characters
 * @private
 */
function _escapeSpecialCharacters(str) {
    return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
}
