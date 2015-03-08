var fs = require('fs'),
    chai = require('chai'),
    $ = require('cheerio'),
    _ = require('lodash')

var inspect = require('eyes').inspector()

chai.should()

var diff = require('../lib/diff'),
    util = require('../lib/util')

describe('diff()', function() {

    var dom1, dom2

    before(function() {

        var opts = {
            recognizeSelfClosing: true,
            lowerCaseAttributeNames: false,
            lowerCaseTags: false
        }

        // runs before all tests in this block
        var xml1 = fs.readFileSync(__dirname + '/fixtures/a1.xml', 'utf8')
        var xml2 = fs.readFileSync(__dirname + '/fixtures/a2.xml', 'utf8')

        dom1 = $.load(xml1, opts)
        dom2 = $.load(xml2, opts)
    })

    it('LinearLayout', function() {

        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: {
                length: '+'
            }
        }

        var result = diff(q, dom1, dom2)
            // console.log(result)
        result.forEach(function(r){
            util.show(r[0])
            util.show(r[1])
        })

    })
})