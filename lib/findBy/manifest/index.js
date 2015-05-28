var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var apps = require('../../db/apps');
var parse = require('../../parse');

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
    // for each app ids in scope
    options.scope.forEach(function (id) {

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
        }

        console.log('%d: %s %s', count, chalk.grey(id),
            matched ? chalk.green('yes') : chalk.red('no'))
        count++;
    })

    return Promise.resolve(results);
}

// analyze the pattern of the given query and lookup a matcher to process the query
function _lookup_matcher(q) {
    if (q.children === undefined && q.count === 1) {
        return _find_by_a_single_tag
    } else {
        console.error('Unrecognized query.');
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
