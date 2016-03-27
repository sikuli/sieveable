'use strict';
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
          .uniq()
          .value();
};

function getTagName(tag) {
  const tagName = tag.name === '_' ? '*' : tag.name;
  if (tagName.indexOf('*') > -1 && !_.isEmpty(tag.attribs)) {
    return Object.keys(tag.attribs).map((attribName) => {
      return `${tagName} AND (${attribName}="${tag.attribs[attribName]}")`;
    });
  }
  else if (tagName.indexOf('*') === -1 && !_.isEmpty(tag.attribs)) {
    return Object.keys(tag.attribs).map((attribName) => {
      if (tag.attribs[attribName] && tag.attribs[attribName].indexOf('*') > -1) {
        return `${tagName} AND ${tag.attribs[attribName]}`;
      }
      return `${tagName}(${attribName}="${tag.attribs[attribName]}")`;
    });
  }
  return tagName;
}
