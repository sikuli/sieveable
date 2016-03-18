'use strict';
const _ = require('lodash'),
  log = require('../../logger'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request').get, { multiArgs: true }),
  xmldom = require('xmldom'),
  config = require('config');

let suffixArray = [],
  tagNames = [];

exports.find = function find(env, query, queryType, options) {
  suffixArray = [];
  tagNames = [];
  // If query is not specified, return everything in scope
  if (!query) {
    return Promise.resolve(options.scope);
  }
  if (queryType === 'ui') {
    return findByUIIndex(query, options.scope);
  }
  else if (queryType === 'manifest') {
    return findByManifestIndex(query, options.scope);
  }
  return Promise.reject(new Error('Unknown index type'));
};

function getSolrRequest(collectionName, arrValues, appIds) {
  const solrConfig = config.get('dbConfig.solr'),
    reqURL = `http://${solrConfig.host}:${solrConfig.port}/solr/${solrConfig[collectionName]}/query`,
    terms = _.map(arrValues, (val) => {
      if (val.indexOf('*') > -1 && val.indexOf('*$') === -1 &&
          val.indexOf('$*') === -1) {
        return _escapeSpecialCharacters(val);
      }
      return `"${_escapeSpecialCharacters(val)}"`;
    }),
    _text_ = terms.join(' && '),
    scope = appIds.join(' OR '),
    reqObj = {
      url: reqURL,
      qs: {
        q: `_text_: ${_text_} AND id:( ${scope} )`,
        wt: 'json',
        rows: config.get('dbConfig.solr.maxRows'),
        fl: 'id'
      }
    };
  function clientError(e) {
    return e.code >= 400 && e.code < 500;
  }
  return request(reqObj)
    .get(1)
    .then((resBody) => {
      const body = JSON.parse(resBody);
      if (body.response) {
        const docs = body.response.docs;
        return Promise.resolve(_.map(docs, 'id'));
      }
      return Promise.resolve([]);
    })
    .catch(clientError, (e) => {
      log.error(e);
      return Promise.reject(e);
    });
}

function findByUIIndex(query, scope) {
  _extractTags(query);
  if (suffixArray.length > 0 && tagNames.length > 0) {
    return Promise.all([getSolrRequest('uiTagCollection', tagNames, scope),
              getSolrRequest('uiSuffixCollection', suffixArray, scope)])
      .then((ids) => {
        const inter = _.intersection(ids[0], ids[1]);
        return Promise.resolve(inter);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index results from the' +
          ` uiTagCollection and uiSuffixCollection. Reason: ${e.message}`));
      });
  }
  else if (suffixArray.length > 0 && tagNames.length === 0) {
    return getSolrRequest('uiSuffixCollection', suffixArray, scope)
      .then((ids) => {
        return Promise.resolve(ids);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index ' +
          `results from the uiSuffixCollection. Reason: ${e.message}`));
      });
  }
  else if (tagNames.length > 0 && suffixArray.length === 0) {
    return getSolrRequest('uiTagCollection', tagNames, scope)
      .then((ids) => {
        return Promise.resolve(ids);
      })
      .catch((e) => {
        return Promise.reject(new Error('Failed to get index ' +
          `results from the uiTagCollection Reason: ${e.message}`));
      });
  }
  return Promise.reject(new Error('IndexSearchError: No tags are ' +
      'found for the given query'));
}

function findByManifestIndex(query, scope) {
  _extractTags(query);
  if (tagNames.length === 0 && suffixArray.length > 0) {
    _.forEach(suffixArray, (item) => {
      tagNames.push(item.split('$'));
    });
    tagNames = _.flattenDeep(tagNames);
    tagNames = _.uniq(tagNames);
  }
  return getSolrRequest('manifestCollection', tagNames, scope)
    .then((ids) => {
      return Promise.resolve(ids);
    })
    .catch((e) => {
      return Promise.reject(new Error('Failed to get index ' +
        `results from the manifestCollection. Reason: ${e.message}`));
    });
}

function _extractTags(queryText) {
  const doc = new xmldom.DOMParser().parseFromString(queryText, 'text/xml'),
    rootElementList = _.filter(doc.childNodes, (child) => {
      return child.nodeType === 1;
    });
  // Add xml tags that have star e.g.,(<com.myview.* />, <com.myview.* attr="2"/>)
  _.forEach(doc.childNodes, (child) => {
    if (child.nodeType === 3 && child.data.indexOf('*') > -1) {
      const tagWithStar = child.data.split('/>')[0];
      if (tagWithStar && tagWithStar.indexOf(' ') > -1) {
        tagNames.push(tagWithStar.split(' ')[0]);
      }
      else {
        tagNames.push(tagWithStar);
      }
    }
  });
  _.forEach(rootElementList, (root) => {
    addTagName(root);
    const children = _.filter(root.childNodes, (child) => {
      return child.nodeType === 1;
    });
    _.forEach(children, (child) => {
      addChildren(child, root);
    });
  });
}

function addChildren(element, parent) {
  const parentName = parent.localName === '_' ? '*' : parent.localName,
    elementName = element.localName === '_' ? '*' : element.localName;
  if (element.hasChildNodes()) {
    suffixArray.push(`${parentName}$${elementName}`);
    const children = _.filter(element.childNodes, (child) => {
      return child.nodeType === 1;
    });
    _.forEach(children, (child) => {
      addChildren(child, element);
    });
  }
  else {
    // add tag name and attributes for the ui-tag and manifest indexes
    addTagName(element);
    suffixArray.push(`${parentName}$${elementName}`);
  }
}

function addTagName(element) {
  let elementName = element.localName;
  // Skip anonymous tags
  if (element.localName === '_') {
    elementName = '*';
  }
  // Add element name and attributes
  if (element.attributes.length > 0) {
    _.forEach(element.attributes, (attr) => {
      const attrName = _ExtractReturnParameters(attr.nodeName),
        attrVal = _ExtractReturnParameters(attr.nodeValue);
      let searchTerm = elementName;
      if (attrName && attrVal) {
        if (attrVal.indexOf('*') > -1) {
          searchTerm += ` AND ${attrVal}`;
        }
        else {
          searchTerm += `(${attrName}="${attrVal}")`;
        }
      }
      else if (attr.nodeValue) {
        const val = getAttributeValue(attr.nodeValue);
        if (val !== undefined) {
          tagNames.push(val);
        }
      }
      tagNames.push(searchTerm);
    });
  } // Add element tag name and attributes
  else {
    tagNames.push(elementName);
  }
}

// Filter attribute values that contain *
function getAttributeValue(value) {
  if (value.indexOf('*') > -1) {
    return _ExtractReturnParameters(value);
  }
  return value;
}

/**
 * Escape a string that uses any of Solr's special characters except the *.
 * + - && || ! ( ) { } [ ] ^ " ~ ? : /
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with a single backslash proceeding the
 * special character.
 * @private
 */
function _escapeSpecialCharacters(str) {
  let escaped = str.replace(/([\+\-!\(\)\{}\[\]\^"~\?:\/])/g, '\\$1');
  escaped = escaped.replace('&&', '\\&&');
  escaped = escaped.replace('||', '\\||');
  return escaped;
}

// e.g. <element>(app*)</element> and <element="(*)">(*)</element>
function _ExtractReturnParameters(value) {
  let newValue = value;
  if (value && value.trim()
    .indexOf('(') === 0) {
    if (value.trim()[value.length - 1] === ')') {
      newValue = value.trim().substring(1, value.length - 1);
    }
  }
  if (value === '*') {
    return null;
  }
  return newValue;
}
