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

function explain(text) {
  const parts = getQueryParts(text),
    query = {};
  query.match = getMatchVariables(parts.match);
  query.listing = getQueryText(parts.where, LISTING_RESERVED, LISTING_FIELDS);
  query.manifest = getQueryText(parts.where, MANIFEST_RESERVED);
  query.code = getQueryText(parts.where, CODE_RESERVED);
  query.ui = getUIQueryText(parts.where);
  query.return = getReturnVariables(parts.return);
  query.limit = getLimit(parts.limit);
  query.mode = getMode(parts.mode);
  try {
    validateQuery(query);
    const q = _.pick(query, _.identity),
      explainedQuery = {
        match: q.match,
        listing: q.listing,
        ui: q.ui,
        manifest: q.manifest,
        code: q.code,
        perm: q.perm,
        return: q.return,
        limit: q.limit,
        mode: q.mode
      };
    return _.pick(explainedQuery, _.identity);
  }
  catch (ex) {
    log.error('Invalid Query in %s. Reason: %s', text, ex.message);
  }
}

function getMatchVariables(text) {
  return text.split(',');
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
  return text.split(',');
}

function getLimit(text) {
  // Default to 100 limit
  const limitText = text ? text : '100';
  return parseInt(limitText, 10);
}

function getMode(text) {
  // Default to strict mode
  if (text.trim() !== 'normal') {
    return 'strict';
  }
  return 'normal';
}

function getQueryParts(query) {
  const queryParts = {},
    queryText = query.toLowerCase()
    .trim(),
    matchIndex = queryText.indexOf('match'),
    whereIndex = queryText.indexOf('where'),
    returnIndex = queryText.lastIndexOf('return'),
    limitIndex = queryText.lastIndexOf('limit'),
    modeIndex = queryText.lastIndexOf('mode');

  queryParts.match = matchIndex > -1 ?
    query.substring(matchIndex + 5, whereIndex)
    .trim() : '';
  queryParts.where = whereIndex > -1 ?
    query.substring(whereIndex + 5, returnIndex)
    .trim() : '';
  if (returnIndex > -1) {
    if (limitIndex > -1) {
      queryParts.return = query.substring(returnIndex + 6, limitIndex);
    }
    else {
      if (modeIndex > -1) {
        queryParts.return = query.substring(returnIndex + 6, modeIndex)
          .trim();
      }
      else {
        queryParts.return = query.substring(returnIndex + 6, query.length)
          .trim();
      }
    }
  }
  else {
    queryParts.return = '';
  }
  if (limitIndex > -1) {
    if (modeIndex > -1) {
      if (queryParts.limit === limitIndex > -1) {
        queryParts.limit = query.substring(limitIndex + 5, modeIndex);
      }
      else {
        queryParts.limit = '';
      }
    }
  }
  if (modeIndex > -1) {
    queryParts.mode = query.substring(modeIndex + 4, query.length);
  }
  else {
    queryParts.mode = 'strict';
  }

  return queryParts;
}

function validateQuery(query) {
  if (query.match) {
    if (query.listing || query.ui || query.manifest || query.code || query.perm) {
      if (query.return) {
        return true;
      }
    }
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
    if ('children' in elem && elem.children.length > 0 &&
      _.indexOf(reservedWords, elem.name.toLowerCase()) > -1) {
      if ('type' in elem && elem.type === 'tag') {
        let elementName = elem.name;
        if (replaceFields) {
          elementName = replaceFields[elementName];
        }
        const parent = xml.ele(elementName, elem.attribs, getElemData(elem));
        doChildren(elem, parent, replaceFields);
      }
    }
    else if (_.indexOf(reservedWords, elem.name.toLowerCase()) > -1) {
      let elementName = elem.name;
      if (replaceFields) {
        elementName = replaceFields[elementName];
      }
      xml.ele(elementName, elem.attribs, getElemData(elem));
    }
  });
  xml = xml.end({ pretty: false }).toString();
  // remove the injected root node
  $ = cheerio.load(xml, OPTIONS);
  if ($(root)
    .children()
    .length > 0) {
    const first = xml.indexOf('<' + root + '>') + root.length + 2,
      last = xml.indexOf('</' + root + '>');
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
    const first = xml.indexOf('<' + root + '>') + root.length + 2,
      last = xml.indexOf('</' + root + '>');
    return xml.substring(first, last);
  }
  return undefined;
}

function doChildren(elem, xml, replaceFields) {
  _.forEach(elem.children, (c) => {
    if ('name' in c && c.name !== undefined) {
      let elementName = c.name;
      if (replaceFields) {
        elementName = replaceFields[elementName];
      }
      const cElem = xml.ele(elementName, c.attribs, getElemData(c));
      if ('length' in c.children && c.children.length > 0) {
        doChildren(c, cElem);
      }
    }
  });
}

function getElemData(elem) {
  if ('children' in elem && elem.children[0] && 'data' in elem.children[0]) {
    return elem.children[0].data.trim();
  }
}
module.exports = explain;
