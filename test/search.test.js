var should = require('chai').should()
var search = require('../lib')

describe('search', function() {

    var q, results
    beforeEach(function(done) {

    	// parse the titile of each 'it' as the query
        q = JSON.parse(this.currentTest.title)

        // invoke search on the query
        search(q, function(err, ret) {
            results = ret
            done()
        })
    })

    it('{"app": "com.evernote"}', function() {
    })


})