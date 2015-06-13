var _ = require('lodash'),
    cheerio = require('cheerio'),
    through2 = require('through2'),
    File = require('vinyl')

// given an array of files,
// return an index object
function build() {

    var index = {}

    function addDocumentToIndex(doc) {
        var appInfo = _extract_all_tagnames(doc);
        var wordCounts = appInfo.count;
        var id = appInfo.name + '-' + appInfo.version_code;

        _.forEach(wordCounts, function (count, word) {

            // init to [] if necessary
            index[word] = index[word] || []

            var record = {
                id: id,
                count: count
            }
            index[word].push(record)

        })
    }

    return new through2.obj(function (file, enc, callback) {

        addDocumentToIndex(file)
        callback()

    }, function (callback) {

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
    var app = $('App')[0].attribs;
    // get all tag names
    var tagNames = _.pluck($('*').toArray(), 'name');

    // count them
    app.count = _.countBy(tagNames);

    return app;
}

module.exports = build