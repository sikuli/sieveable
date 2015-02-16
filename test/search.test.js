var should = require('chai').should()
var search = require('../lib')

// wrap 'q' around 'it' to take a query object and convert it to a title string
var q = function(query, callback) {
    it(JSON.stringify(query), callback)
}

describe('search', function() {

    var query, results
    beforeEach(function(done) {

        // parse the titile of each 'it' as the query
        query = JSON.parse(this.currentTest.title)

        // invoke search on the query
        search(query, function(err, ret) {
            results = ret
            done()
        })
    })

    var json = JSON.stringify

    describe('packageName', function() {

        q({
            packageName: 'com.rarepebble'
        }, function() {

            results.should.have.length(1)
        })

        q({
            packageName: "do.not.exist"
        }, function() {

            results.should.have.length(0)
        })

    })

    var data = {
        {
            name: 'bob',
            children: ['a', 'b']
        }, {
            name: 'amy',
            children: ['c', 'd', 'e']
        }, {
            name: 'tom',
            children: ['c', 'd', 'e']
        }        
    }

    describe('activities', function() {

        q({
            activities: {
                $size: {
                    $gt: 3
                }
            }
        }, function() {

            results.should.have.length(1)
        })

        q({

            activities: [any,any,any]

        }, function() {

            results.should.have.length(1)
        })

    })


    '<activities>
    	<activity></activity> * 10+
    </activities>'

})