'use strict';

module.exports = co;
const $ = require('cheerio'),
    _ = require('lodash');

function co(target, dom) {
    // compute a path up to the root node
    const path = $(target).parentsUntil().toArray().map((x) => {
        return [$(x).index(), x.name];
    }).reverse();
    path.push([$(target).index(), target.name]);

    // follow a given path and return the node
    // at the end of the path
    function traverse(node, path) {
        if (path.length > 0) {
            const p = path[0],
                i = p[0],
                // name = p[1],
            // console.log('node.name=', node.name, 'p=', p, 'i=', i, 'name=', name)
            // $(node.children).toArray().forEach(function(x){
            //     console.log(x.type, x.name, x.data)
            // })
                child = $(node).children().get(i);
            // console.log(child.name)

            // console.log('node.children[i]', node.children.type)
            if (node.children === undefined || node.children.length < i) {
                // can not go further down
                return null;
            } else {
                // console.log(node.children.length,i)
                return traverse(child, _.rest(path));
            }
        } else {
            // console.log('found', node)
            return node;
        }
    }

    const root = dom.root()[0].children[0],
        // console.log(root)
        found = traverse(root, _.rest(path));
    return found;
}
