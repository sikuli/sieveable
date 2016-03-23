'use strict';
const _ = require('lodash'),
  cheerio = require('cheerio');

exports.parse = function parse(queryText) {
  return { tagNames: getTagNames(queryText) };
};


function getTagNames(queryText) {
  const $ = cheerio.load(queryText, { xmlMode: true }),
    tags = _.filter($('*'), (element) => {
      return element.type === 'tag';
    }),
    names = _.map(tags, (tag) => {
      if (!_.isEmpty(tag.attribs)) {
        return Object.keys(tag.attribs).map((attribName) => {
          return `${tag.name}(${attribName}="${tag.attribs[attribName]}")`;
        });
      }
      return tag.name;
    });
  return _.flattenDeep(names);
}
