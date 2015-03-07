module.exports = correspond
var $ = require('cheerio'),
    _ = require('lodash')

// given a 'target' node, find a corresponding node in 'dom'
function correspond(target, dom) {

    var path = _path_from_root(target)

    var root = dom.root()[0].children[0]

    var found = _traverse(root, _.rest(path))
    
    return found
}

// calculate a path from the root to the given 'target' node
function _path_from_root(target) {
    var path = $(target).parentsUntil().toArray().map(function(x) {
        var path_part = [$(x).index(), x.name]
        return path_part
    }).reverse()
    path.push([$(target).index(), target.name])
    return path
}

// follow a given path and return the node at the end of the path
function _traverse(node, path) {
    // console.log('p ', path)
    if (path.length > 0) {
        var p = path[0]
        var i = p[0]
        var name = p[1]
        var child = $(node).children().get(i)
            // console.log(child.name)

        if (child) {
            return _traverse(child, _.rest(path))

        } else {
            // can not go further down
            return null
        }

    } else {

        return node
    }
}