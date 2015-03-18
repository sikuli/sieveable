module.exports = build

var fs = require('fs')

// load an index from path
function load(path){

    return JSON.parse(fs.readFileSync(path))
    
}
