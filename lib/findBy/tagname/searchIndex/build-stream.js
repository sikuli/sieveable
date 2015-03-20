module.exports = build

var _ = require('lodash'),
    cheerio = require('cheerio'),
    through2 = require('through2'),
    File = require('vinyl')

// given an array of files,
// return an index object
function build() {

    var index = {}    
    var uid = 0

    function addDocumentToIndex(doc) {
        var wordCounts = _extract_all_tagnames(doc)

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

    return new through2.obj(function(file, enc, callback) {

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


function _extract_all_tagnames(doc) {
    var $ = cheerio.load(doc.contents, {
        recognizeSelfClosing: true,
        xmlMode: true
    })

    // get all tag names
    var tagNames = _.pluck($('*').toArray(), 'name')

    // count them
    var x = _.countBy(tagNames)

    return x
}