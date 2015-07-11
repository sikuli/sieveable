var _ = require('lodash');
var S = require('string');
var log = require("../../logger");
var matchHelper = require("./match-helper");

module.exports = function lookup_matcher(q, app, $) {
    matchHelper.init();
    if (q.children === undefined && q.count === 1) {
        return _find_by_a_single_tag(q, $);
    } else if (q.children === undefined && q.count > 1) {
        return _find_by_siblings_of_one_type(q, $);
    }
    else if (q.children === undefined && q.count > 1) {
        return _find_by_siblings_of_one_type(q, $);
    }
    else if (q.children === undefined && q.length > 1) {
        return _find_by_siblings_of_multiple_types(q, $);
    }
    else if (q.children && q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q, app, $);
    } else if (q.children && q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_tags(q, $);
    } else {
        log.error('Unrecognized UI query.');
        return false;
    }
};

function _find_by_a_single_tag(q, $) {
    var found = false;
    var returnAttribute = undefined;
    var selector = matchHelper.get_element_name(q);

    // find a custom tag like: <com.app.*/>
    if (selector.indexOf('*') != -1) {
        var results = _.filter($('*'), function (val) {
            if ('attributes' in q && q.attributes.length > 0) {
                if (S(val.name).startsWith(q.name.split('*')[0])) {
                    selector = matchHelper.escapeSpecialCharacters(val.name) +
                        matchHelper.escapeSpecialCharacters(
                            matchHelper.getAttributeSelectors(q.attributes));
                    return $(selector).length >= q.count;
                }
            }
            else {
                selector = val.name;
                return S(selector).startsWith(q.name.split('*')[0]);
            }
        });
        found = results.length >= q.count;
        returnAttribute = matchHelper.getReturnAttributes(results, q.attributes);
        return {
            matched: found,
            returnAttributes: returnAttribute
        };
    }
    if ('min' in q) {
        found = $(selector).length > q.min;
    } else if ('max' in q) {
        found = $(selector).length < q.count;
    } else if ('exactly' in q) {
        found = $(selector).length == q.exactly;
    }
    else {
        found = $(selector).length >= q.count;
    }
    returnAttribute = matchHelper.getReturnAttributes($(selector), q.attributes);
    return {
        matched: found,
        returnAttributes: returnAttribute
    };
}

function _find_by_a_single_tag_with_n_children_of_one_tag(q, app, dom) {
    var $ = dom || app
    var selector = matchHelper.get_element_name(q)
    var childName = matchHelper.get_child_name(q.children[0])
    var childCount = q.children[0].count
    var result;
    var returnAttribute;
    if (typeof $ === 'function') {
        // Find each selector that is nth in relation to its sibling selector
        // with the same element name.
        if (childName === '*') {
            result = $(selector + ' > ' + childName)
            returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
        }
        else {
            result = $(selector + ' > ' + childName + ':nth-of-type(' + childCount + ')')
            returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
        }
    }
    else {
        result = $.children(childName);
    }
    if ('children' in q.children[0] && result.length >= childCount) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q.children[0], result)
    }
    var found = result.length >= childCount;
    return {
        matched: found,
        returnAttributes: returnAttribute
    }
}

function _find_by_a_single_tag_with_n_children_of_multiple_tags(q, $) {
    // Find the children of the single tag and count their children
    // as siblings of each other.
    // Example: $('LinearLayout').children('ImageView ~ RatingBar')
    var selector = matchHelper.get_element_name(q);
    var childrenNames = [];
    _.forEach(q.children, function (child) {
        var fullChildName = matchHelper.get_child_name(child);
        childrenNames.push(_.repeat(fullChildName + " ~ ", child.count));
    });
    // Join the array and remove the last three characters for " ~ "
    var querySiblings = childrenNames.join('').slice(0, -3);
    var result = $(selector).children(querySiblings);
    var found = result.length >= 1;
    var returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
    return {
        matched: found,
        returnAttributes: returnAttribute
    }
}

function _find_by_siblings_of_one_type(q, $) {
    var selector = matchHelper.get_element_name(q);
    var result = $(selector + ':nth-of-type(' + q.count + ')');
    var returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
    var found = result.length > 0;
    return {
        matched: found,
        returnAttributes: returnAttribute
    }
}

function _find_by_siblings_of_multiple_types(q, $) {
    var childrenNames = [];
    _.forEach(q, function (child) {
        var fullChildName = matchHelper.get_element_name(child);
        childrenNames.push(_.repeat(fullChildName + " ~ ", child.count));
    });
    // Join the array and remove the last three characters for " ~ "
    var querySiblings = childrenNames.join('').slice(0, -3);
    var result = $(querySiblings);
    var returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
    var found = result.length > 0;
    return {
        matched: found,
        returnAttributes: returnAttribute
    }
}