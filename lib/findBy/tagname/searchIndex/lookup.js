module.exports = lookup

var _ = require('lodash'),
    Promise = require('bluebird')

var debug = console.log

/**
 *
 * replace special elements with their possible values in the index.
 *       e.g., replaces com.google.* with com.google.android.maps.MapView and
 *          com.google.android.youtube.player.YouTubeThumbnailView.
 *       Replaces *.android.maps.MapView with com.google.android.maps.MapView  and
 *          com.google.android.gms.maps.MapView
 *
 * @param index the index that contains all the elements.
 * @param words the list of words in the query.
 * @returns a new array of unique values after replacing the special elements.
 * @private
 */
function _resolveWords(index, words) {
    var result = []
    words.forEach(function (word) {
        if (word.indexOf('*') == word.length - 1) {
            result.push(_.filter(Object.keys(index), function (w) {
                return _.startsWith(w, word.split('*')[0])
            }));
        }
        else if (word.indexOf('*') == 0) {
            result.push(_.filter(Object.keys(index), function (w) {
                return _.endsWith(w, word.split('*')[1])
            }));
        }
        else {
            return result.push(word)
        }
    });

    return _.unique(_.flattenDeep(result));

}

// search in the index for docs matching the given query
// return a list of ids
function lookup(index, query) {

    var words = _resolveWords(index, query.words);

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

    var idsForAllWords = _.map(words, function (word) {

        // get the ids of the list of docs containing this word
        var ids = _.pluck(index[word], 'id')
        // debug(ids)
        return ids

    })

    // debug(idsForAllWords)
    var results = _.reduce(idsForAllWords, function (intersectionOfAll, idsPerWord, index) {
        // debug(intersectionOfAll, idsPerWord, index)
        return _.intersection(intersectionOfAll, idsPerWord)
    })

    // debug(results)
    return new Promise(function (resolve, reject) {
        resolve(results)
    })
    // return results
}