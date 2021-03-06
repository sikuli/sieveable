'use strict';
const xmldom = require('xmldom'),
  _ = require('lodash'),
  cheerio = require('cheerio');
let suffixNames = [];

function filterTags(nodes) {
  return _.filter(nodes, (node) => {
    return node.nodeType === 1;
  });
}

/**
* returns true if the given query contains an invalid tag name.
* An invalid tag name is a name that is not useful in the resulted suffix array.
* For example, the anonymous name "_" is not useful in the suffix array.
*/
function hasInvalidTagName(text) {
  const $ = cheerio.load(text, { xmlMode: true });
  return _.some($('*'), (element) => {
    return element.type === 'tag' && element.name === '_';
  });
}
/**
* Parses the given XML string and returns the suffix array of XML tags.
* The suffix array shows the leaf to parent path of an XML tag.
* If the query contains wildcard or anonymous, an empty array is returned.
* @param {string} queryText - The search query text.
* @return {Array} An array of XML tag names.
*/
exports.getSuffixNames = function getSuffixArray(queryText) {
  try {
    if (hasInvalidTagName(queryText)) {
      throw new Error('InvalidSynatxForSuffixNames');
    }
    suffixNames = [];
    const doc = new xmldom.DOMParser({ errorHandler: (e) => {
        throw e;
      }
    }).parseFromString(queryText, 'text/xml'),
      rootElementList = filterTags(doc.childNodes);
    _.forEach(rootElementList, (root) => {
      if (root.hasChildNodes()) {
        doChildren(root, []);
      }
    });
    return suffixNames;
  }
  catch (e) {
    return [];
  }
};

function doChildren(child, parentList) {
  if (child.hasChildNodes()) {
    const childNodes = filterTags(child.childNodes);
    parentList.push(child.localName);
    _.forEach(childNodes, (cNode) => {
      doChildren(cNode, parentList);
    });
  }
  else {
    const parents = getParents(child, []);
    suffixNames.push(`${parents.join('$')}$${child.localName}`);
  }
}

function getParents(node, parentList) {
  if (node.parentNode !== null) {
    parentList.push((node.parentNode.localName));
    return getParents(node.parentNode, parentList);
  }
  return _.reverse(_.compact(parentList));
}
