'use strict';
const _ = require('lodash'),
  cheerio = require('cheerio'),
  builder = require('xmlbuilder'),
  log = require('./logger'),
  LISTING_RESERVED = ['description', 'store-url',
    'store-category', 'price', 'date-published', 'version-name',
    'version-code',
    'android-version', 'rating-count', 'rating', 'content-rating', 'developer',
    'developer-url', 'install-size', 'title', 'install-size-text', 'downloads',
    'downloads-count-text', 'description', 'reviews', 'whats-new',
    'package-name'],
  LISTING_FIELDS = {
    'store-category': 'cat',
    'content-rating': 'crat',
    developer: 'crt',
    'developer-url': 'curl',
    downloads: 'dct',
    description: 'desc',
    'date-published': 'dtp',
    'downloads-count-text': 'dtxt',
    'package-name': 'n',
    'whats-new': 'new',
    'android-version': 'os',
    price: 'pri',
    rating: 'rate',
    'rating-count': 'rct',
    reviews: 'rev',
    'install-size': 'sz',
    'install-size-text': 'sztxt',
    title: 't',
    'store-url': 'url',
    'version-code': 'verc',
    'version-name': 'vern'
  },
  MANIFEST_RESERVED = ['manifest', 'uses-permission', 'permission',
    'permission-tree',
    'permission-group', 'instrumentation', 'uses-sdk', 'uses-configuration',
    'uses-feature', 'supports-screens', 'compatible-screens',
    'supports-gl-texture',
    'application', 'activity', 'intent-filter', 'action', 'category', 'data',
    'meta-data', 'activity-alias', 'service', 'receiver', 'provider',
    'grant-uri-permission', 'path-permission', 'uses-library'
  ],
  CODE_RESERVED = ['code'],
  // JOIN_RESERVED = ['and', 'or', 'nor'],
  OPTIONS = {
    recognizeSelfClosing: true,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false,
    xmlMode: true
  };
function constructQuery(parts) {
  const query = {};
  query.match = getMatchVariables(parts.match);
  query.listing = getQueryText(parts.where, LISTING_RESERVED, LISTING_FIELDS);
  query.manifest = getQueryText(parts.where, MANIFEST_RESERVED);
  query.code = getQueryText(parts.where, CODE_RESERVED);
  query.ui = getUIQueryText(parts.where);
  query.return = getReturnVariables(parts.return);
  query.limit = getLimit(parts.limit);
  query.mode = getMode(parts.mode);
  return _.pickBy(query, _.identity);
}

function explain(text) {
  try {
    const parts = getQueryParts(text),
      q = constructQuery(parts);
    validateQuery(q);
    return q;
  }
  catch (ex) {
    log.error({ name: 'InvalidQuery', query: text, message: ex.message });
    return undefined;
  }
}

function getMatchVariables(text) {
  const matchClause = text.replace(/ /g, '').toLowerCase(),
    propFirstIndex = matchClause.indexOf('app('),
    proplastIndex = matchClause.lastIndexOf(')');
  if (propFirstIndex > -1 && proplastIndex === matchClause.length - 1) {
    const propsLine = matchClause.substring(propFirstIndex + 4, proplastIndex),
      props = _.map(propsLine.split(','), (prop) => {
        const propsArray = prop.split('=');
        if (propsArray.length !== 2) {
          throw new Error('Invalid match clause');
        }
        let val = propsArray[1];
        if (propsArray[1] === 'true' || propsArray[1] === 'false') {
          val = Boolean(propsArray[1]);
        }
        return { name: propsArray[0], value: val };
      });
    return { app: 'app', props };
  }
  return { app: 'app' };
}

// TODO: Split join keywords
function getQueryText(text, reservedWords, replaceFields) {
  return parseInput(text, 'query', reservedWords, replaceFields);
}

// TODO: Split join keywords
function getUIQueryText(text) {
  const reservedWords = _.union(LISTING_RESERVED, MANIFEST_RESERVED,
    CODE_RESERVED);
  return parseUIInput(text, 'query', reservedWords);
}

function getReturnVariables(text) {
  return text.split(',')
    .map((item) => {
      return item.trim();
    });
}

function getLimit(text) {
  // Default to 100 limit
  const limitText = text || '100';
  return parseInt(limitText, 10);
}

function getMode(text) {
  // Default to strict mode
  if (text.trim() !== 'normal') {
    return 'strict';
  }
  return 'normal';
}

function getReturnPart(query, returnIndex, limitIndex, modeIndex) {
  if (returnIndex > -1 && limitIndex > -1) {
    return query.substring(returnIndex + 6, limitIndex);
  }
  else if (returnIndex > -1 && modeIndex > -1) {
    return query.substring(returnIndex + 6, modeIndex).trim();
  }
  else if (returnIndex > -1 && modeIndex === -1) {
    return query.substring(returnIndex + 6, query.length).trim();
  }
  return '';
}

function getLimitPart(query, limitIndex, modeIndex) {
  if (modeIndex > -1 && limitIndex > -1) {
    return query.substring(limitIndex + 5, modeIndex);
  }
  return '';
}

function getModePart(query, modeIndex) {
  if (modeIndex > -1) {
    return query.substring(modeIndex + 4, query.length);
  }
  return 'strict';
}

function getQueryParts(query) {
  const queryParts = {},
    queryText = query.toLowerCase().trim(),
    matchIndex = queryText.indexOf('match'),
    whereIndex = queryText.indexOf('where'),
    returnIndex = queryText.lastIndexOf('return'),
    limitIndex = queryText.lastIndexOf('limit'),
    modeIndex = queryText.lastIndexOf('mode');

  queryParts.match = matchIndex > -1 ?
    query.substring(matchIndex + 5, whereIndex).trim() : '';
  queryParts.where = whereIndex > -1 ?
    query.substring(whereIndex + 5, returnIndex).trim() : '';
  queryParts.return = getReturnPart(query, returnIndex, limitIndex, modeIndex);
  queryParts.limit = getLimitPart(query, limitIndex, modeIndex);
  queryParts.mode = getModePart(query, modeIndex);
  return queryParts;
}

function validateQuery(query) {
  if (query.match && query.return) {
    return _.some(query, (value, key) => {
      return _.indexOf(['listing', 'ui', 'manifest', 'code'], key) > -1
                       && !_.isEmpty(value);
    });
  }
  throw new Error('Syntax Error.');
}


function parseInput(input, root, reservedWords, replaceFields) {
  // inject a root node
  let xml = builder.create(root),
    // parse the xml input
    $ = cheerio.load(input, OPTIONS);
  const children = _.filter($.root()[0].children, (c) => {
    return c.type === 'tag';
  });
  _.forEach(children, (elem) => {
    if (elem.children && elem.children.length > 0 &&
      _.indexOf(reservedWords, elem.name.toLowerCase()) > -1 && elem.type === 'tag') {
      const elementName = replaceFields ? replaceFields[elem.name] : elem.name,
        parent = xml.ele(elementName, elem.attribs, getElemData(elem));
      doChildren(elem, parent, replaceFields);
    }
    else if (_.indexOf(reservedWords, elem.name.toLowerCase()) > -1) {
      const elementName = replaceFields ? replaceFields[elem.name] : elem.name;
      xml.ele(elementName, elem.attribs, getElemData(elem));
    }
  });
  xml = xml.end({ pretty: false }).toString();
  // remove the injected root node
  $ = cheerio.load(xml, OPTIONS);
  if ($(root)
    .children()
    .length > 0) {
    const first = xml.indexOf(`<${root}>`) + root.length + 2,
      last = xml.indexOf(`</${root}>`);
    return xml.substring(first, last);
  }
  return undefined;
}

function parseUIInput(input, root, reservedWords) {
  // inject a root node
  let xml = builder.create(root),
    // parse the xml input
    $ = cheerio.load(input, OPTIONS);
  const children = _.filter($.root()[0].children, (c) => {
    return c.type === 'tag';
  });
  _.forEach(children, (elem) => {
    if ('children' in elem && elem.children.length > 0 &&
      _.indexOf(reservedWords, elem.name.toLowerCase()) === -1) {
      if ('type' in elem && elem.type === 'tag') {
        const parent = xml.ele(elem.name, elem.attribs, getElemData(elem));
        doChildren(elem, parent);
      }
    }
    else if (_.indexOf(reservedWords, elem.name.toLowerCase()) === -1) {
      xml.ele(elem.name, elem.attribs, getElemData(elem));
    }
  });
  xml = xml.end({ pretty: false }).toString();
  // remove the injected root node
  $ = cheerio.load(xml, OPTIONS);
  if ($(root)
    .children()
    .length > 0) {
    const first = xml.indexOf(`<${root}>`) + root.length + 2,
      last = xml.indexOf(`</${root}>`);
    return xml.substring(first, last);
  }
  return undefined;
}

function doChildren(elem, xml, replaceFields) {
  _.forEach(elem.children, (c) => {
    if ('name' in c && c.name !== undefined) {
      const elementName = replaceFields ? replaceFields[c.name] : c.name,
        cElem = xml.ele(elementName, c.attribs, getElemData(c));
      if ('length' in c.children && c.children.length > 0) {
        doChildren(c, cElem);
      }
    }
  });
}

function getElemData(elem) {
  if (elem.children && elem.children[0] && 'data' in elem.children[0]) {
    return elem.children[0].data.trim();
  }
  return undefined;
}
module.exports = explain;
