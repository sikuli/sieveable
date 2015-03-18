module.exports = build

var extract = require('./extract'),
_ = require('lodash')

// given an array of files,
// return an index object
function build(docs, extractFunc){

    var index = {}

    function addDocumentToIndex(doc){
        var wordCounts = extractFunc(doc)

        _.forEach(wordCounts, function(count, word){

            // init to [] if necessary
            index[word] = index[word] || []        
            
            var record = {
                    id: doc.id,
                    count: count
            }
            index[word].push(record)

        })        
    }    

    docs.forEach(addDocumentToIndex)

    return index
}
