'use strict';
const _ = require('lodash'),
  log = require('../../logger'),
  matchHelper = require('./match-helper'),
  strictMatcher = require('./strict-matcher');

/* Ancestor descendant matcher
 * Match elements that are descendants of a given ancestor.
 */

module.exports = function lookupMatcher(q, app, $) {
  matchHelper.init();
  if (q.children === undefined && q.count === 1) {
    // single tag search
    return strictMatcher(q, app, $);
  }
  else if (q.children === undefined && (q.count > 1 || q.length > 1)) {
    // siblings search
    return strictMatcher(q, app, $);
  }
  else if (q.children && q.children.length === 1) {
    return _findByASingleTagWithNChildrenOfOneTag(q, app, $);
  }
  else if (q.children && q.children.length > 1) {
    return _findByASingleTagWithNChildrenOfMultipleTags(q, $);
  }
  log.error('Unrecognized query.', q);
  return false;
};

// Find all descendant elements of a given element.
function _findByASingleTagWithNChildrenOfOneTag(q, app, dom) {
  const $ = dom || app,
    selector = matchHelper.getElementName(q),
    childName = matchHelper.getChildName(q.children[0]),
    childCount = q.children[0].count;
  let result,
    returnAttribute;
  if (typeof $ === 'function') {
    result = $(`${selector} ${childName}`);
    returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
  }
  else {
    result = $.children(childName);
  }
  if ('children' in q.children[0] && result.length >= childCount) {
    return _findByASingleTagWithNChildrenOfOneTag(q.children[0], result);
  }
  return {
    matched: result.length >= childCount,
    returnAttributes: returnAttribute
  };
}

function _findByASingleTagWithNChildrenOfMultipleTags(q, $) {
  const selector = matchHelper.getElementName(q),
    returnAttributes = [],
    childrenNames = [];
  _.forEach(q.children, (child) => {
    const fullChildName = matchHelper.getChildName(child);
    for (let i = 0; i < child.count; i++) {
      childrenNames.push(fullChildName);
    }
  });

  const allChildrenFound = _.every(childrenNames, (child) => {
    const result = $(`${selector} > ${child}`);
    if (result.length > 0) {
      returnAttributes.push(matchHelper.getReturnAttributes(result,
        q.attributes));
      return true;
    }
    return false;
  });
  return {
    matched: allChildrenFound,
    returnAttributes: _.compact(returnAttributes)
  };
}
