'use strict';
const $ = require('cheerio'),
    _ = require('lodash'),
    sort = require('./sort.js');

function parse(text) {
    const c = $.load(text, {
            recognizeSelfClosing: true,
            lowerCaseAttributeNames: false,
            lowerCaseTags: false
        }),
        elements = c.root().children().toArray(),
        ret = parseHelper(elements),
        // unwrap [d] to d
        result = ret.length === 1 ? ret[0] : ret;
    return result;
}

function parseHelper(input) {
    if ('length' in input) {
        // it is an array of nodes
        const nodes = input,
            v = _.compact(nodes.map((node) => {
                return parseHelper(node);
            }));
        return _groupByTagName(v);
    }
    else if (input.type === 'tag') {
        // it is a dom node
        const node = input;
        // assign attributes
        let attributes = node.attribs;
        if (!_.isEmpty(attributes)) {
            attributes = _.map(attributes, (val, key) => {
                let toReturn = false;
                if (val.trim().indexOf('(') === 0 &&
                    val.trim().indexOf(')') === val.trim().length - 1) {
                    toReturn = true;
                }
                return { name: key, value: val, toReturn: toReturn };
            });
        }
        let ourNode = {
            type: node.type,
            name: node.name,
            attributes: attributes
        };

        if (_.isEmpty(attributes)) {
            delete ourNode.attributes;
        } else {
            ourNode = sort(ourNode);
        }

        if (node.children.length > 0) {
            const children = parseHelper(node.children);
            ourNode.children = children;
        }
        return ourNode;
    }
}

function _groupByTagName(nodes) {
    const groups = _.groupBy(nodes, 'name'),
        ret = _.map(groups, (value, key) => {
            /* e.g., groups
             *
             * value = [ { type: 'tag', name: 'Button',
             *           attributes:[{name: 'android:layout_width', value: 'fill_parent'} ]},
             *           { type: 'tag', name: 'Button',
             *            attributes:[{name: 'android:layout_width', value: 'fill_parent'} ]}]
             * key = 'Button'
             */
            const attribs = [];
            _.each(value, (val) => {
                if (!('attributes' in val)) {
                    attribs.push(undefined);
                }
                else {
                    attribs.push(JSON.stringify(val.attributes));
                }
            });
            const result = {
                type: 'tag',
                name: key,
                attributes: _.compact(attribs),
                count: value.length
            };

            if (value[0].children) {
                result.children = value[0].children;
            }

            if (result.attributes.length === 0) {
                delete result.attributes;
                return result;
            }
            else {
                return _groupByTagNameAndAttributes(result, key);
            }
        }
    );
    return _.flatten(ret);
}

function _groupByTagNameAndAttributes(result, key) {
    const attributesString = _.map(result.attributes, (v) => {
            return JSON.stringify(v);
        }),
        // count the occurrences of each attribute in the array
        aggregateAttributes = _.countBy(attributesString, _.identity()),
        ret = _.map(aggregateAttributes, (c, uniqueAttributes) => {
            const attributes = _getAttributes(uniqueAttributes),
                r = {
                    type: 'tag',
                    name: key,
                    attributes: JSON.parse(attributes),
                    count: c
                };
            if (result.children) {
                r.children = result.children;
            }
            return r;
        });
    return ret;
}

function _getAttributes(attributes) {
    const attrString = '{\"attributes\"' + ':' + attributes + '}',
        p = JSON.parse(attrString);
    return p.attributes;
}
module.exports = parse;
