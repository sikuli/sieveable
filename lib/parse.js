var $ = require('cheerio'),
    _ = require('lodash')

function parse(text) {

    var c = $.load(text, {
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    })

    var root = c.root().children().toArray()

    var ret = parseHelper(root)

    // unwrap [d] to d
    return ret.length === 1 ? ret[0] : ret
}

function parseHelper(input) {

    if ('length' in input) {

        // it is an array of nodes
        var nodes = input

        return _.compact(nodes.map(function(node) {

            return parseHelper(node)
        }));


    } else if(input.type == 'tag'){

        // it is a dom node
        var node = input

        var ourNode = {
            type: node.type,
            name: node.name
        }

        if (node.children.length > 0) {

            var children = parseHelper(node.children)

            children = _groupByTagName(children)

            ourNode.children = children
        }

        return ourNode

    }
}

function _groupByTagName(nodes){


    var groups = _.groupBy(nodes, 'name')
    return _.map(groups, function(value, key){

        // e.g., 
        //
        // value = [ { type: 'tag', name: 'Button' },
        //             { type: 'tag', name: 'Button' } ]
        // key = 'Button'

        return {
            type: 'tag',
            name: key,
            count: value.length
        }

    })

}

module.exports = parse
