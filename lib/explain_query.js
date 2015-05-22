var _ = require('lodash'),
    cheerio = require('cheerio'),
    builder = require('xmlbuilder');

var LISTING_RESERVED = ['description', 'store-url', 'store-category', 'price',
    'date-published', 'version-name', 'version-code', 'android-version',
    'rating-count', 'rating', 'content-rating', 'developer', 'developer-url',
    'install-size', 'title', 'install-size-text', 'downloads',
    'downloads-count-text', 'description', 'reviews', 'whats-new', 'package-name'];

var PERM_RESERVED = ['callpath'];

var LISTING_FIELDS = {
    'store-category': 'cat',
    'content-rating': 'crat',
    'developer': 'crt',
    'developer-url': 'curl',
    'downloads': 'dct',
    'description': 'desc',
    'date-published': 'dtp',
    'downloads-count-text': 'dtxt',
    'package-name': 'n',
    'whats-new': 'new',
    'android-version': 'os',
    'price': 'pri',
    'rating': 'rate',
    'rating-count': 'rct',
    'reviews': 'rev',
    'install-size': 'sz',
    'install-size-text': 'sztxt',
    'title': 't',
    'store-url': 'url',
    'version-code': 'verc',
    'version-name': 'vern'
};

var MANIFEST_RESERVED = ['manifest', 'uses-permission',
    'permission', 'permission-tree',
    'permission-group', 'instrumentation',
    'uses-sdk', 'uses-configuration',
    'uses-feature', 'supports-screens',
    'compatible-screens',
    'supports-gl-texture',
    'application', 'activity',
    'intent-filter',
    'action', 'category', 'data',
    'meta-data', 'activity-alias',
    'service', 'receiver', 'provider',
    'grant-uri-permission', 'path-permission',
    'uses-library'
];

var CODE_RESERVED = ['code'];

var JOIN_RESERVED = ['and', 'or', 'nor'];

var OPTIONS = {
    recognizeSelfClosing: true,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false
};

function explain(text) {
    var parts = getQueryParts(text);
    var query = {};
    query.match = getMatchVariables(parts.match);
    query.listing = getQueryText(parts.where, LISTING_RESERVED, LISTING_FIELDS);
    query.manifest = getQueryText(parts.where, MANIFEST_RESERVED);
    query.code = getQueryText(parts.where, CODE_RESERVED);
    query.perm = getQueryText(parts.where, PERM_RESERVED);
    query.ui = getUIQueryText(parts.where);
    query.return = getReturnVariables(parts.return);
    query.limit = getLimit(parts.limit);
    try {
        validateQuery(query);
        var q = _.pick(query, _.identity);
        var explainedQuery = {
            match: q.match,
            listing: q.listing,
            ui: q.ui,
            manifest: q.manifest,
            code: q.code,
            perm: q.perm,
            return: q.return,
            limit: q.limit
        };
        return _.pick(explainedQuery, _.identity);
    }
    catch (ex) {
        console.error('Invalid Query.');
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
    var reservedWords = _.union(LISTING_RESERVED, MANIFEST_RESERVED, CODE_RESERVED, PERM_RESERVED);
    return parseUIInput(text, 'query', reservedWords);
}

function getReturnVariables(text) {
    return text.split(',');
}

function getLimit(text) {
    // Default to 100 limit
    var limitText = text ? text : '100';
    return parseInt(limitText, 10);
}

function getQueryParts(query) {
    var queryParts = {};
    var queryText = query.toLowerCase().trim();
    var matchIndex = queryText.indexOf('match');
    var whereIndex = queryText.indexOf('where');
    var returnIndex = queryText.lastIndexOf('return');
    var limitIndex = queryText.lastIndexOf('limit');

    queryParts.match = matchIndex > -1 ?
        query.substring(matchIndex + 5, whereIndex).trim() : '';
    queryParts.where = whereIndex > -1 ?
        query.substring(whereIndex + 5, returnIndex).trim() : '';
    if (returnIndex > -1) {
        if (limitIndex > -1) {
            queryParts.return = query.substring(returnIndex + 6, limitIndex)
        } else {
            queryParts.return = query.substring(returnIndex + 6, query.length).trim()
        }
    } else {
        queryParts.return = '';
    }
    queryParts.limit = limitIndex > -1 ?
        query.substring(limitIndex + 5, query.length) : '';

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
    throw new Error('Invalid Query.')
}


function parseInput(input, root, reservedWords, replaceFields) {
    // inject a root node
    var xml = builder.create(root);
    // parse the xml input
    var $ = cheerio.load(input, OPTIONS);

    var children = _.filter($.root()[0].children, function (c) {
        return c.type == 'tag'
    });
    _.forEach(children, function (elem) {
        if ('children' in elem && elem.children.length > 0 &&
            _.indexOf(reservedWords, elem.name.toLowerCase()) > -1) {
            if ('type' in elem && elem.type == 'tag') {
                var elementName = elem.name;
                if (replaceFields) {
                    elementName = replaceFields[elementName];
                }
                var parent = xml.ele(elementName, elem.attribs, getElemData(elem));
                doChildren(elem, parent, replaceFields);
            }
        }
        else if (_.indexOf(reservedWords, elem.name.toLowerCase()) > -1) {
            var elementName = elem.name;
            if (replaceFields) {
                elementName = replaceFields[elementName];
            }
            xml.ele(elementName, elem.attribs, getElemData(elem));
        }
    });
    xml = xml.end({pretty: false}).toString();
    // remove the injected root node
    $ = cheerio.load(xml, OPTIONS);
    if ($(root).children().length > 0) {
        var first = xml.indexOf('<' + root + '>') + root.length + 2;
        var last = xml.indexOf('</' + root + '>');
        return xml.substring(first, last);
    }
    else {
        return undefined
    }
}

function parseUIInput(input, root, reservedWords) {
    // inject a root node
    var xml = builder.create(root);
    // parse the xml input
    var $ = cheerio.load(input, OPTIONS);
    var children = _.filter($.root()[0].children, function (c) {
        return c.type == 'tag'
    });
    _.forEach(children, function (elem) {
        if ('children' in elem && elem.children.length > 0 &&
            _.indexOf(reservedWords, elem.name.toLowerCase()) == -1) {
            if ('type' in elem && elem.type == 'tag') {
                var parent = xml.ele(elem.name, elem.attribs, getElemData(elem));
                doChildren(elem, parent);
            }
        }
        else if (_.indexOf(reservedWords, elem.name.toLowerCase()) == -1) {
            xml.ele(elem.name, elem.attribs, getElemData(elem));
        }
    });
    xml = xml.end({pretty: false}).toString();
    // remove the injected root node
    $ = cheerio.load(xml, OPTIONS);
    if ($(root).children().length > 0) {
        var first = xml.indexOf('<' + root + '>') + root.length + 2;
        var last = xml.indexOf('</' + root + '>');
        return xml.substring(first, last);
    }
    else {
        return undefined
    }

}

function doChildren(elem, xml, replaceFields) {
    _.forEach(elem.children, function (c) {
        if ('name' in c && c.name != undefined) {
            var elementName = c.name;
            if (replaceFields) {
                elementName = replaceFields[elementName];
            }
            xml.ele(elementName, c.attribs, getElemData(c));
            if ('length' in c.children && c.children.length > 0) {
                doChildren(c, xml);
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