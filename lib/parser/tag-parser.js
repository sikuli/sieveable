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
      const tagName = tag.name === '_' ? '*' : tag.name;
      if (!_.isEmpty(tag.attribs)) {
        return Object.keys(tag.attribs).map((attribName) => {
          return `${tagName}(${attribName}="${tag.attribs[attribName]}")`;
        });
      }
      return tagName;
    });
  return _.chain(names)
          .flattenDeep()
          .uniq()
          .value();
};
