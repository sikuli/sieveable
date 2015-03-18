var fs = require('fs'),
    chai = require('chai'),
    $ = require('cheerio'),
    _ = require('lodash')

var inspect = require('eyes').inspector()
chai.should()

var build = require('../lib/indexer/build')
var extract = require('../lib/indexer/extract')
var search = require('../lib/indexer/search')

describe('indexer', function() {

    var doc1, doc2, big

    before(function() {
        doc1 = {
            id: 1,
            contents: fs.readFileSync(__dirname + '/fixtures/a1.xml', 'utf8')
        }

        doc2 = {
            id: 2,
            contents: fs.readFileSync(__dirname + '/fixtures/a2.xml', 'utf8')
        }

        doc3 = {
            id: 3,
            contents: fs.readFileSync(__dirname + '/fixtures/big.xml', 'utf8')
        }

    })

    describe('search', function() {

        var index = {
            'LinearLayout': [{
                id: 1,
                count: 3
            }],
            'ImageButton': [{
                id: 1,
                count: 4
            }, {
                id: 2,
                count: 2
            }]
        }


        it('query has two element', function(){
            var q = {
                words: ['ImageButton', 'LinearLayout']
            }

            // inspect(index)
            var actual = search(index, q)
            // inspect(actual)
            
            actual.should.have.members([1])
    
        })

        it('query has one element name', function(){
            var q = {
                words: ['ImageButton']
            }

            // inspect(index)
            var actual = search(index, q)
            // inspect(actual)

            actual.should.have.members([1,2])
        })

        it('query has non-existent element name', function(){
            var q = {
                words: ['DoNotExist']
            }

            // inspect(index)
            var actual = search(index, q)
            // inspect(actual)

            actual.should.have.be.empty
        })
        
    })

    it('build ', function() {

        var index = build([doc1, doc2, doc3], extract)

        var actual = index['LinearLayout']
        // inspect(actual)
        var expected =
            [{
                id: 1,
                count: 8
            }, {
                id: 2,
                count: 8
            }, {
                id: 3,
                count: 471
            }]

        actual.should.be.deep.equal(expected)
    })

    it('extract ', function(done) {

        var actual = extract(doc1)
            // inspect(actual)

        var expected = {
            App: 1,
            Directory: 1,
            File: 4,
            LinearLayout: 8,
            EditText: 4,
            Button: 9
        }

        actual.should.be.deep.equal(expected)

        done()
    })

})