module.exports = build

var extract = require('./extract'),
    _ = require('lodash'),
    through2 = require('through2'),
    File = require('vinyl')

// given an array of files,
// return an index object
function build() {

    var index = {}
    var extractFunc = extract
    var uid = 0

    function addDocumentToIndex(doc) {
        var wordCounts = extractFunc(doc)

        _.forEach(wordCounts, function(count, word) {

            // init to [] if necessary
            index[word] = index[word] || []

            var record = {
                id: uid,
                count: count
            }
            index[word].push(record)            

        })

        // auto increment
        uid = uid + 1
    }

    // docs.forEach(addDocumentToIndex)

    return new through2.obj(function(file, enc, callback){

        addDocumentToIndex(file)
        callback()

    }, function(callback) {

        var indexFile = new File({
            cwd: '',
            base: '',
            path: 'index.json',
            contents: new Buffer(JSON.stringify(index))
        })
        // console.log(indexFile)
        this.push(indexFile)
        callback(null, indexFile)
    })
}