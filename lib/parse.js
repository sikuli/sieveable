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
    elements = c.root()
    .children()
    .toArray(),
    ret = parseHelper(elements),
    // unwrap [d] to d
    result = ret.length === 1 ? ret[0] : ret;
  return result;
}

function parseAttributes(attributes) {
  if (_.isEmpty(attributes)) {
    return undefined;
  }
  return _.map(attributes, (val, key) => {
    let toReturn = false;
    if (val.trim()
      .indexOf('(') === 0 &&
      val.trim()
      .indexOf(')') === val.trim()
      .length - 1) {
      toReturn = true;
    }
    return {
      name: key,
      value: val,
      toReturn
    };
  });
}

function addAttributes(node, attributes) {
  let ourNode = node;
  if (attributes) {
    ourNode.attributes = attributes;
    ourNode = sort(node);
  }
  return ourNode;
}

function parseHelper(input) {
  if ('length' in input) {
    // it is an array of nodes
    const nodes = input,
      v = _.compact(nodes.map((node) => {
        return parseHelper(node);
      }));
    return groupByTagName(v);
  }
  else if (input.type === 'tag') {
    // it is a dom node
    const node = input,
      // assign attributes
      attributes = parseAttributes(node.attribs);
    let ourNode = {
      type: node.type,
      name: node.name
    };
    ourNode = addAttributes(ourNode, attributes);

    if (node.children.length > 0) {
      ourNode.children = parseHelper(node.children);
    }
    return ourNode;
  }
  return undefined;
}

function groupByTagName(nodes) {
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
      const attribs = _.map(value, (val) => {
          if (!('attributes' in val)) {
            return undefined;
          }
          return JSON.stringify(val.attributes);
        }),
        result = {
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
      return groupByTagNameAndAttributes(result, key);
    });
  return _.flatten(ret);
}

function groupByTagNameAndAttributes(result, key) {
  const attributesString = _.map(result.attributes, (v) => {
      return JSON.stringify(v);
    }),
    // count the occurrences of each attribute in the array
    aggregateAttributes = _.countBy(attributesString, _.identity()),
    ret = _.map(aggregateAttributes, (c, uniqueAttributes) => {
      const attributes = getAttributes(uniqueAttributes),
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

function getAttributes(attributes) {
  const attrString = `{"attributes":${attributes}}`,
    p = JSON.parse(attrString);
  return p.attributes;
}
module.exports = parse;
