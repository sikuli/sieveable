const _ = require('lodash'),
  cheerio = require('cheerio');

/**
 * Parses the given query and returns an array of XML tag names.
 * @param {string} queryText - The search query text.
 * @return {Array} An array of XML tag names.
 */
exports.getTagNames = function getTagNames(queryText) {
  const $ = cheerio.load(queryText, { xmlMode: true }),
    tags = _.filter($('*'), (element) => {
      return element.type === 'tag';
    }),
    names = _.map(tags, (tag) => {
      return getTagName(tag);
    });
  return _.chain(names)
          .flattenDeep()
          .compact()
          .uniq()
          .value();
};

function getTagName(tag) {
  const tagName = tag.name === '_' ? '*' : tag.name;
  if (tagName.indexOf('*') > -1 && !_.isEmpty(tag.attribs)) {
    return _.map(Object.keys(tag.attribs), (attribName) => {
      const attrName = extractReturnParameters(attribName),
        attrVal = extractReturnParameters(tag.attribs[attribName]);
      return getTagAttributePair(tagName, attrName, attrVal);
    });
  }
  else if (tagName.indexOf('*') === -1 && !_.isEmpty(tag.attribs)) {
    return _.map(Object.keys(tag.attribs), (attribName) => {
      const attrName = extractReturnParameters(attribName),
        attrVal = extractReturnParameters(tag.attribs[attribName]);
      return getTagAttributePair(tagName, attrName, attrVal);
    });
  }
  return tagName;
}

function getTagAttributePair(tagName, attrName, attrVal) {
  if (tagName.indexOf('*') === -1 && attrVal && attrVal.indexOf('*') === -1) {
    return `${tagName}(${attrName}="${attrVal}")`;
  }
  else if (tagName.indexOf('*') > -1 && attrVal && attrVal.indexOf('*') === -1) {
    return [tagName, `${attrName}="${attrVal}"`];
  }
  else if (attrVal && attrVal.indexOf('*') > -1) {
    return [tagName, attrVal];
  }
  else if (tagName && ! attrVal) {
    return tagName;
  }
  return undefined;
}

// e.g. <element>(app*)</element> and <element="(*)">(*)</element>
function extractReturnParameters(value) {
  if (value && value.trim().indexOf('(') === 0 && value.trim()[value.length - 1] === ')') {
    if (value.trim().substring(1, value.length - 1) === '*') {
      return undefined;
    }
    return value.trim().substring(1, value.length - 1);
  }
  if (value === '*') {
    return undefined;
  }
  return value;
}
