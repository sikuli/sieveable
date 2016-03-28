'use strict';
const _ = require('lodash'),
  parse = require('../../parse');

exports.getSmaliQueryLine = function getCodeQueryText(query) {
  const codeQueries = getSmaliQueries(query),
    terms = _.map(codeQueries, (codeQuery) => {
      return `"${_escapeSpecialCharacters(codeQuery)}"`;
    });
  return terms.join(' && ');
};

function getSmaliQueries(query) {
  let queryObj = parse(query);
  const lines = [];
  if (queryObj instanceof Array === false) {
    queryObj = [queryObj];
  }
  _.forEach(queryObj, (v) => {
    let line = '';
    _.forEach(v.attributes, (attrib) => {
      if (attrib.name.toLowerCase() === 'class') {
        line += `L${attrib.value.replace(/\./g, '/')}`;
      }
      else if (attrib.name.toLowerCase() === 'method') {
        line += `;->${attrib.value}`;
      }
    });
    if (line !== '') {
      lines.push(line);
    }
  });
  return lines;
}

/**
 * Escape a string that uses any of Solr's special characters.
 * + - && || ! ( ) { } [ ] ^ " ~ * ? : /
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with a single backslash proceeding the
 * special character.
 * @private
 */
function _escapeSpecialCharacters(str) {
  let escaped = str.replace(/([\+\-!\(\)\{}\[\]\^"~\*\?:\/])/g, '\\$1');
  escaped = escaped.replace('&&', '\\&&');
  escaped = escaped.replace('||', '\\||');
  return escaped;
}
