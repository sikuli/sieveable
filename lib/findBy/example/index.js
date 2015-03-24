var _ = require('lodash'),
    Promise = require('bluebird'),
    chalk = require('chalk'),
    apps = require('../../db/apps')

module.exports = {
    init: init,
    find: find
}

function init(env) {
    return apps
        .init()
        .then(function(ret) {
            env.apps = ret
            return env
        })
}

function find(env, query, options) {

    // array to collect results
    var results = []

    // for each app ids in scope
    options.scope.forEach(function(id) {

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

    return new Promise(function(resolve, reject) {
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
        return _find_by_a_single_tag_with_n_children
    } else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_kinds
    } else {
        console.error('Unrecognized query.');
        return function() {
            return false
        }
    }

}


function _find_by_a_single_tag(q, app) {
    var $ = app.dom
    var selector = q.name;

    // find a custom tag like: <__ __name="com.whatsapp.*"/>
    if (selector == '__' && 'attributes' in q) {
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
    } else if ('count' in q) {
        $(selector).length == q.count;
    }
    return $(selector).length > 0
}

function _find_by_a_single_tag_with_n_children(q, app) {
    var $ = app.dom
    var childName = q.children[0].name;
    var count = q.children[0].count;
    return _.some($(q.name).toArray(), function(elem) {
        if ($(elem).children(childName).length == count) {
            return true;
        }
    });
}

function _find_by_a_single_tag_with_n_children_of_multiple_kinds(q, app) {
    var $ = app.dom
    var childrenNames = new Array();
    var countValues = new Array();
    q.children.forEach(function(item) {
        childrenNames.push(item.name);
        countValues.push(item.count)
    });
    return _.some($(q.name).toArray(), function(elem) {
        var found = false;
        for (var i = 0; i < childrenNames.length; i++) {
            if ($(elem).children(childrenNames[i]).length == countValues[i]) {
                found = true;
            }
        }
        return found;
    });
}

function _find_by_siblings(q, app) {
    var $ = app.dom
    var first = q[0].name
    return _.some($(first).toArray(), function(elem) {
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

function _getAttributeSelectors(attributes) {
    var attributesSelector = ''
    _.forEach(attributes, function (attrib) {
        var idx = attrib['value'].indexOf('*');
        // Attribute value equals to a value
        if (idx == -1) {
            attributesSelector += '[' + attrib.name + '="' + attrib.value + '"]';
        }
        // Attribute value starts with a value
        else if (idx == attrib['value'].length - 1) {
            attributesSelector += '[' + attrib.name + '^="' + attrib.value.split('*')[0] + '"]';
        }
        // Attribute value ends with a value
        else if (idx == 0) {
            attributesSelector += '[' + attrib.name + '$="' + attrib.value.split('*')[1] + '"]';
        }
    })
    return attributesSelector;
}

function _getCustomTagName(attributes) {
    return _.result(_.find(attributes, {name: '__name'}), 'value');
}