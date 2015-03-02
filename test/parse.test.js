var chai = require('chai')

chai.should()

var parse = require('../lib/parse')

describe('parse', function() {

    it('the simplest query', function() {

        var q = '<LinearLayout></LinaerLayout>'

        var actual = parse(q)

        var expected = {
            type: 'tag',
            name: 'LinearLayout'
        }

        actual.should.deep.equal(expected)

    })


    it('a parent-child relationship', function() {

        var q = '<LinearLayout><Button></Button></LinaerLayout>'

        var actual = parse(q)

        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 1

            }]
        }

        actual.should.deep.equal(expected)

    })
    it('a parent with exactly two children', function() {

        var q = '<LinearLayout><Button></Button><Button></Button></LinaerLayout>'

        var actual = parse(q)

        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 2
            }]            
        }

        actual.should.deep.equal(expected)

    })

})