var _ = require('lodash'),
    Promise = require('bluebird'),
    chalk = require('chalk'),
    apps = require('../../db/apps');

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return apps
        .init()
        .then(function (ret) {
            env.apps = ret
            return env
        })
}

function find(env, query, options) {

    // array to collect results
    var results = []

    // for each app ids in scope
    options.scope.forEach(function (id) {

        var app = env.apps.get(id, {dom: true})

        var matcher = _lookup_matcher(query)

        // apply the matcher to 'app' to see if it maches
        var matched = matcher(query, app)

        // if so
        if (matched) {
            // add to the results array
            results.push(id)
        }

        console.log('%d: %s %s', app.id, chalk.grey(app.packageName + '-' + app.version), matched ? chalk.green('yes') : chalk.red('no'))

    })

    return new Promise(function (resolve, reject) {
        resolve(results)
    })
}

//
// Matchers
//

// analyze the pattern of the given query and lookup a matcher to process the query 
function _lookup_matcher(q) {
    if (q.children === undefined && q.length === undefined) {
        return _find_by_a_single_tag
    } else if ('length' in q && q.length > 1) {
        return _find_by_siblings
    } else if (q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children_of_one_tag
    } else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_tags
    } else {
        console.error('Unrecognized query.');
        return function () {
            return false
        }
    }

}


function _find_by_a_single_tag(q, app) {
    var $ = app.dom
    var selector = _get_element_name(q)

    // find a custom tag like: <__ __name="com.whatsapp.*"/>
    if (selector.indexOf('*') != -1 && 'attributes' in q) {
        selector = _getCustomTagName(q.attributes);
        var otherAttributes = _.filter(q.attributes, function (attrib) {
            return !(_.startsWith(attrib.name, '__'));
        })
        return _.filter($('*'), function (val) {
            var allAttributesFound = true;
            if (otherAttributes.length > 0) {
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
    return $(selector).length > 0
}

function _find_by_a_single_tag_with_n_children_of_one_tag(q, app) {
    var $ = app.dom || app
    var selector = _get_element_name(q)
    var childName = _get_child_name(q.children[0])
    var childCount = q.children[0].count
    var result
    if (typeof $ === 'function'){
        // Find each selector that is nth in relation to its sibling selector with the same element name.
        result = (childName === '*') ? $(selector + ' > ' + childName) :
            $(selector + ' > ' + childName + ':nth-of-type(' + childCount + ')')
    }
    else{
        result = $.children(childName);
    }
    if ('children' in q.children[0] && result.length >= childCount) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q.children[0], result)
    }
    return result.length  >= childCount
}

function _find_by_a_single_tag_with_n_children_of_multiple_tags(q, app) {
    var $ = app.dom
    var selector = _get_element_name(q)
    var childrenNames = new Array()
    var countValues = new Array()
    q.children.forEach(function (item) {
        childrenNames.push(_get_child_name(item));
        countValues.push(item.count)
    });
    var result = _.some($(selector).toArray(), function (elem) {
        var found = false;
        for (var i = 0; i < childrenNames.length; i++) {
            if ($(elem).children(childrenNames[i]).length == countValues[i]) {
                found = true;
            }
            else{
                return false;
            }
        }
        return found;
    });
    return result > 0
}

function _find_by_siblings(q, app) {
    var $ = app.dom
    var first = q[0].name
    return _.some($(first).toArray(), function (elem) {
        var found = false;
        for (var i = 1; i < q.length; i++) {
            if ($(elem).siblings(q[i].name).length == q[i].count) {
                found = true;
                continue;
            } else {
                found = false;
                break;
            }
        }
        if (found == true) {
            return found;
        }
    });
}

function _get_element_name(element) {
    var selector = element.name
    if (selector == '__' && 'attributes' in element) {
        selector = _getCustomTagName(element.attributes);
    }
    selector = _escapeSpecialCharacters(selector)
    selector = selector.replace('?', '*')
    if ('attributes' in element) {
        var actualAttributes = _filterExtraAttributes(element.attributes)
        selector += _getAttributeSelectors(actualAttributes)
    }
    return selector
}

function _get_child_name(child) {
    var childName = child.name
    if (childName == '__') {
        childName = _getCustomTagName(child.attributes)
    }
    childName = childName.replace('?', '*')
    if ('attributes' in child) {
        var actualAttributes = _filterExtraAttributes(child.attributes)
        childName += _getAttributeSelectors(actualAttributes)
    }
    if (childName != '*') {
        childName = _escapeSpecialCharacters(childName)
    }
    return childName;

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

function _getCustomTagName(attributes) {
    return _.result(_.find(attributes, {name: '__name'}), 'value');
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
