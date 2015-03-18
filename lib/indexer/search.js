module.exports = search

var _ = require('lodash')

var debug = console.log

// search in the index for docs matching the given query
function search(index, query) {

    var words = query.words

    // e.g.,
    //
    // index = {
    //     LinearLayout: [{
    //         id: 1,
    //         count: 3
    //     }],
    //     ImageButton: [{
    //         id: 1,
    //         count: 4
    //     }, {
    //         id: 2,
    //         count: 2
    //     }]
    // }
    //
    // 
    // query = {
    //     words: ['ImageButton', 'LinearLayout']
    // }

    var idsForAllWords = _.map(query.words, function(word) {

            // get the ids of the list of docs containing this word
            var ids = _.pluck(index[word], 'id')
                // debug(ids)
            return ids

        })

    // debug(idsForAllWords)

    var results = _.reduce(idsForAllWords, function(intersectionOfAll, idsPerWord, index) {
        // debug(intersectionOfAll, idsPerWord, index)
        return  _.intersection(intersectionOfAll, idsPerWord)
    })

    // debug(results)

    return results
}