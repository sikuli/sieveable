var $ = require('cheerio'),
    _ = require('lodash'),
    sort = require('./sort.js');

function parse(text) {
    var c = $.load(text, {
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    })

    var elements = c.root().children().toArray()

    var ret = parseHelper(elements)
    // unwrap [d] to d    
    var result = ret.length === 1 ? ret[0] : ret
    return result;
}

function parseHelper(input) {

    if ('length' in input) {

        // it is an array of nodes
        var nodes = input

        var v = _.compact(nodes.map(function (node) {

            return parseHelper(node)
        }))
        
        return _groupByTagName(v)

    } else if (input.type == 'tag') {

        // it is a dom node
        var node = input
        // assign attributes
        var attributes = node.attribs
        if (!_.isEmpty(attributes)) {
            attributes = _.map(attributes, function (val, key) {
                return {name: key, value: val}
            });
        }
        var ourNode = {
            type: node.type,
            name: node.name,
            attributes: attributes
        }

        if (_.isEmpty(attributes)) {
            delete ourNode.attributes;
        } else {
            ourNode = sort(ourNode)
        }

        if (node.children.length > 0) {
            var children = parseHelper(node.children)
            ourNode.children = children
        }        
        return ourNode

    }
}

function _groupByTagName(nodes) {
    var groups = _.groupBy(nodes, 'name')
    var ret = _.map(groups, function (value, key) {

            /* e.g., groups
            *
            * value = [ { type: 'tag', name: 'Button',
            *           attributes:[{name: 'android:layout_width', value: 'fill_parent'} ]},
            *           { type: 'tag', name: 'Button',
            *            attributes:[{name: 'android:layout_width', value: 'fill_parent'} ]}]
            * key = 'Button'
            */
            var attribs = new Array();
            _.each(value, function (val) {
                if (!('attributes' in val)) {
                    attribs.push(undefined);
                }
                else {
                    attribs.push(JSON.stringify(val.attributes));
                }
            })
            
            var result = {
                type: 'tag',
                name: key,
                attributes: _.compact(attribs),
                count: value.length              
            }

            if (value[0].children){
                result.children = value[0].children
            }

            if (result.attributes.length == 0) {
                delete result.attributes;
                return result;
            }
            else {
                return _groupByTagNameAndAttributes(result, key)
            }

        }
    )
    
    var ret =  _.flatten(ret)
    return ret
}

function _groupByTagNameAndAttributes(result, key) {
    var attributesString = _.map(result.attributes, function (v) {
        return JSON.stringify(v)
    });
    //count the occurrences of each attribute in the array    
    var aggregateAttributes = _.countBy(attributesString, _.identity());
    var ret = _.map(aggregateAttributes, function (c, uniqueAttributes) {
        var attributes = _getAttributes(uniqueAttributes);
        var r = {
            type: 'tag',
            name: key,
            attributes: JSON.parse(attributes),
            count: c            
        }
        if (result.children)
            r.children = result.children
        return r
    });
    return ret;
}

function _getAttributes(attributes) {
    var attrString = "{\"attributes\"" + ":" + attributes + "}";
    var p = JSON.parse(attrString);
    return p.attributes
}
module.exports = parse
