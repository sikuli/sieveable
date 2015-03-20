module.exports = co
var $ = require('cheerio'),
    _ = require('lodash')

function co(target, dom) {

    // compute a path up to the root node        
    var path = $(target).parentsUntil().toArray().map(function(x) {
        var path_part = [$(x).index(), x.name]
        return path_part
    }).reverse()
    path.push([$(target).index(), target.name])

    // console.log(path)

    // follow a given path and return the node
    // at the end of the path
    function traverse(node, path) {
        // console.log('p ', path)
        // return
        if (path.length > 0) {
            var p = path[0]
            var i = p[0]
            var name = p[1]
            // console.log('node.name=', node.name, 'p=', p, 'i=', i, 'name=', name)
            // $(node.children).toArray().forEach(function(x){
            //     console.log(x.type, x.name, x.data)
            // })
            var child = $(node).children().get(i)
            // console.log(child.name)

            // console.log('node.children[i]', node.children.type)
            if (node.children === undefined || node.children.length < i) {
                // can not go further down
                return null
            } else {
                // console.log(node.children.length,i)     
                return traverse(child, _.rest(path))
            }
        } else {
            // console.log('found', node)
            return node
        }
    }

    var root = dom.root()[0].children[0]
        // console.log(root)
    var found = traverse(root, _.rest(path))
    return found
}