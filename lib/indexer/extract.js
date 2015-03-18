module.exports = extract

var cheerio = require('cheerio'),
    _ = require('lodash')

function extract(doc) {
    return _extract_all_tagnames(doc)
}

function _extract_all_tagnames(doc){
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