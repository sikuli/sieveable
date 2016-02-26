const $ = require('cheerio'),
  _ = require('lodash');

function co(target, dom) {
  // compute a path up to the root node
  const path = $(target)
    .parentsUntil()
    .toArray()
    .map((x) => {
      return [$(x)
        .index(), x.name];
    })
    .reverse();
  path.push([$(target).index(), target.name]);

  // follow a given path and return the node
  // at the end of the path
  function traverse(node, nodePath) {
    if (nodePath.length > 0) {
      const p = nodePath[0],
        i = p[0],
        child = $(node)
        .children()
        .get(i);
      if (node.children === undefined || node.children.length < i) {
        // can not go further down
        return null;
      }
      return traverse(child, _.rest(nodePath));
    }
    return node;
  }

  const root = dom.root()[0].children[0],
    found = traverse(root, _.rest(path));
  return found;
}

module.exports = co;
