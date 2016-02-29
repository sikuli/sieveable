/* eslint complexity: [2, 6] */
/* eslint max-statements: [2, 15] */
const _ = require('lodash'),
  log = require('../../logger'),
  matchHelper = require('./match-helper');

/* Direct children matcher
 * Match elements that are direct children of a given element.
 */

module.exports = function lookupMatcher(q, app, $) {
  matchHelper.init();
  if (q.children === undefined && q.count === 1) {
    return _findBySingleTag(q, $);
  }
  else if (q.children === undefined && q.count > 1) {
    return _findBySiblingsOfOneType(q, $);
  }
  else if (q.children === undefined && q.length > 1) {
    return _findBySiblingsOfMultipleTypes(q, $);
  }
  else if (q.children && q.children.length === 1) {
    return _findByASingleTagWithNChildrenOfOneTag(q, app, $);
  }
  else if (q.children && q.children.length > 1) {
    return _findByASingleTagWithNChildrenOfMultipleTags(q, $);
  }
  log.error('Unrecognized UI query.', q);
  return false;
};

function _findBySingleTag(q, $) {
  'use strict';
  let found = false,
    returnAttribute = undefined,
    selector = matchHelper.getElementName(q);

  // find a custom tag like: <com.app.*/>
  if (selector.indexOf('*') !== -1) {
    const results = _.filter($('*'), (val) => {
      if ('attributes' in q && q.attributes.length > 0) {
        if (_.startsWith(val.name, q.name.split('*')[0])) {
          selector = matchHelper.escapeSpecialCharacters(val.name) +
            matchHelper.escapeSpecialCharacters(
              matchHelper.getAttributeSelectors(q.attributes));
          return $(selector).length >= q.count;
        }
      }
      selector = val.name;
      return _.startsWith(selector, q.name.split('*')[0]);
    });
    found = results.length >= q.count;
    returnAttribute = matchHelper.getReturnAttributes(results, q.attributes);
    return {
      matched: found,
      returnAttributes: returnAttribute
    };
  }
  if ('min' in q) {
    found = $(selector)
      .length > q.min;
  }
  else if ('max' in q) {
    found = $(selector)
      .length < q.count;
  }
  else if ('exactly' in q) {
    found = $(selector)
      .length === q.exactly;
  }
  else {
    found = $(selector)
      .length >= q.count;
  }
  returnAttribute = matchHelper.getReturnAttributes($(selector), q.attributes);
  return {
    matched: found,
    returnAttributes: returnAttribute
  };
}
// Find all direct child elements of a given element.
function _findByASingleTagWithNChildrenOfOneTag(q, app, dom) {
  'use strict';
  const $ = dom || app,
    selector = matchHelper.getElementName(q),
    childName = matchHelper.getChildName(q.children[0]),
    childCount = q.children[0].count;
  let result,
    returnAttribute;
  if (typeof $ === 'function') {
    // Find each selector that is nth in relation to its sibling selector
    // with the same element name.
    if (childName === '*') {
      result = $(`${selector} > ${childName}`);
      returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
    }
    else {
      result = $(`${selector} > ${childName}:nth-of-type(${childCount})`);
      returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
    }
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
  // Find the children of the single tag and count their children
  // as siblings of each other.
  // Example: $('LinearLayout').children('ImageView ~ RatingBar')
  const selector = matchHelper.getElementName(q),
    childrenNames = _.map(q.children, (child) => {
      const fullChildName = matchHelper.getChildName(child);
      return _.repeat(`${fullChildName} ~ `, child.count);
    }),
    // Join the array and remove the last three characters for " ~ "
    querySiblings = childrenNames.join('').slice(0, -3),
    result = $(selector).children(querySiblings),
    found = result.length >= 1,
    returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
  return {
    matched: found,
    returnAttributes: returnAttribute
  };
}

function _findBySiblingsOfOneType(q, $) {
  const selector = matchHelper.getElementName(q),
    result = $(`${selector}:nth-of-type(${q.count})`),
    returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
  return {
    matched: result.length > 0,
    returnAttributes: returnAttribute
  };
}

function _findBySiblingsOfMultipleTypes(q, $) {
  const childrenNames = _.map(q, (child) => {
      const fullChildName = matchHelper.getElementName(child);
      return _.repeat(`${fullChildName} ~ `, child.count);
    }),
    // Join the array and remove the last three characters for " ~ "
    querySiblings = childrenNames.join('').slice(0, -3),
    result = $(querySiblings),
    returnAttribute = matchHelper.getReturnAttributes(result, q.attributes);
  return {
    matched: result.length > 0,
    returnAttributes: returnAttribute
  };
}
