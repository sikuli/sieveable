var _ = require('lodash'),
    $ = require('cheerio')

var correspond = require('./correspond'),
    util = require('../util')

module.exports = diff

function diff(q, dom1, dom2) {

    var op = differ_by_children(q)

    var name = q.name
    var xs = dom1(name).toArray()

    return _(xs)
        .map(function(x) {

            // find y in dom2 that corresponds to x in dom1
            var y = correspond(x, dom2)

            if (op(x, y)) {
                return [x, y]
            }

        })
        .compact()
        .value()

}

// '+' --> gt
function gt(x, y) {
    return x > y
}

function lt(x, y) {
    return x < y
}

function _parse_relationship(str) {
    if (str == '+')
        return lt
    else if (str == '-')
        return gt
}


function differ_by_children(q) {

    // e.g.,
    //
    // var q = {
    //       type: 'tag',
    //       name: 'LinearLayout',
    //       children: {
    //           length: '+'
    //       }
    //   }

    var changedProp = _.pairs(q.children)[0]
    // e.g., changedProp = ['length', '+']
    
    var name = changedProp[0]
    var code = changedProp[1]
    

    var rel = _parse_relationship(code)
    var val = function(node){
        return $(node).children()[name]
    }

    return function(x, y) {
        var vx = val(x)
        var vy = val(y)
        return rel(vx, vy)
    }
}