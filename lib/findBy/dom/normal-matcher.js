var _ = require('lodash');
var log = require("../../logger");
var matchHelper = require("./match-helper");
var strictMatcher = require("./strict-matcher");

/* Ancestor descendant matcher
 * Match elements that are descendants of a given ancestor.
 */

module.exports = function lookup_matcher(q, app, $) {
    matchHelper.init();
    if (q.children === undefined && q.count === 1) {
        // single tag search
        return strictMatcher(q, app, $);
    }
    else if (q.children === undefined && q.count > 1) {
        // siblings search
        return strictMatcher(q, app, $);
    }
    else if (q.children.length === 1) {
        return _find_by_a_single_tag_with_n_children_of_one_tag(q, app, $);
    }
    else if (q.children.length > 1) {
        return _find_by_a_single_tag_with_n_children_of_multiple_tags(q, $);
    }
    else {
        log.error('Unrecognized query.');
        return false;
    }
};

function _find_by_a_single_tag_with_n_children_of_one_tag(q, app, dom) {
    var $ = dom || app;
    var selector = matchHelper.get_element_name(q);
    var childName = matchHelper.get_child_name(q.children[0]);
    var childCount = q.children[0].count;
    var result;
    var returnAttribute;
    if (typeof $ === 'function') {
        result = $(selector + ' ' + childName);
        returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
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
    var selector = matchHelper.get_element_name(q);
    var childrenNames = [];
    var returnAttributes = [];
    _.forEach(q.children, function (child) {
        var fullChildName = matchHelper.get_child_name(child);
        for (var i = 0; i < child.count; i++) {
            childrenNames.push(fullChildName);
        }
    });

    var allChildrenFound = _.every(childrenNames, function (child) {
        var result = $(selector + " > " + child);
        if (result.length > 0) {
            returnAttributes.push(matchHelper.getReturnAttributes(result,
                q.attributes));
            return true;
        }
    });
    return {
        matched: allChildrenFound,
        returnAttributes: _.compact(returnAttributes)
    }
}