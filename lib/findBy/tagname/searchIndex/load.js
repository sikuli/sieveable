module.exports = load


var lookup = require('./lookup'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require("fs"))


function SearchIndex(index){
    this.index = index
}

SearchIndex.prototype.lookup = function(query){
    return lookup(this.index, query)
}

// load an index from path
function load(path) {

    return fs.readFileAsync(path)
        .then(function(data) {
            var index = JSON.parse(data)
            return new SearchIndex(index)
        })
}