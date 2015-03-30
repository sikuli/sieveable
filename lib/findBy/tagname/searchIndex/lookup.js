module.exports = lookup

var _ = require('lodash'),
    Promise = require('bluebird')

var debug = console.log

/**
 *
 * replace special  wildcard characters in elements with their possible values
 *      in the index. e.g., replaces com.google.* with com.google.android.maps.MapView and
 *          com.google.android.youtube.player.YouTubeThumbnailView.
 *       Replaces *.android.maps.MapView with com.google.android.maps.MapView  and
 *          com.google.android.gms.maps.MapView
 *
 * @param index the index that contains all the elements.
 * @param words the list of words in the query.
 * @returns {customWords: Array, words: Array} An object with two properties,
 * where the customWords property contains an array
 * of unique values after replacing the special wildcard characters (e.g., *),
 * and the words property contains an array of the words with no meta characters.
 * @private
 */
function _resolveWords(index, words) {
    var resultSpecialWords = []
    var resultWords = _.filter(words, function (w) {
        return (w.indexOf('*') === -1 && (w != '?'))
    })
    var specialWords = _.filter(words, function (w) {
        return w.indexOf('*') != -1
    })
    specialWords.forEach(function (word) {
        if (word.indexOf('*') == word.length - 1) {
            resultSpecialWords.push(_.filter(Object.keys(index), function (w) {
                return _.startsWith(w, word.split('*')[0])
            }));
        }
        else if (word.indexOf('*') == 0) {
            resultSpecialWords.push(_.filter(Object.keys(index), function (w) {
                return _.endsWith(w, word.split('*')[1])
            }));
        }
    });
    resultSpecialWords = _.unique(_.flattenDeep(resultSpecialWords))
    return {customWords: resultSpecialWords, words: resultWords}
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

    var idsForWords = _.map(words.words, function (word) {

        // get the ids of the list of docs containing this word
        var ids = _.pluck(index[word], 'id')
        return ids

    })
    var idsForCustomWords = _.map(words.customWords, function (word) {

        // get the ids of the list of docs containing this word
        var ids = _.pluck(index[word], 'id')
        return ids

    })

    // debug(idsForAllWords)
    var resultsForWords = _.reduce(idsForWords, function (intersectionOfAll, idsPerWord, index) {
        // debug(intersectionOfAll, idsPerWord, index)
        return _.intersection(intersectionOfAll, idsPerWord)
    })

    var resultsForCustomWords = _.unique(_.flattenDeep(idsForCustomWords))

    var results = _.union(resultsForWords, resultsForCustomWords).sort(function (a, b) {
        return a - b;
    });


    // debug(results)
    return new Promise(function (resolve, reject) {
        resolve(results)
    })
    // return results
}