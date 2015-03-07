var _ = require('lodash'),
    archy = require('archy'),
    $ = require('cheerio')

module.exports = {
    show: show
}

function show(tree) {
    function toarchy(node) {
        var label = node.name
        if (node.attribs) {
            label = label + '(' + _.trunc(JSON.stringify(node.attribs), 80) + ')'
        }
        return {
            label: label,
            nodes: _.map($(node).children(), toarchy)
        }
    }
    console.log(archy(toarchy(tree)))
}
