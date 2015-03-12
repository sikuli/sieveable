var sort = require('../lib/sort.js'),
    _ = require('lodash'),
    should = require('should');

describe('sort', function () {
    it('order and sort attributes', function (done) {

        var firstObject = {
            name: 'LinearLayout',
            type: 'tag',
            attributes: [{
                value: 'fill_parent',
                name: 'android:layout_height'
            }, {
                name: 'android:layout_width',
                value: 'match_parent'
            }
            ]
        };
        var secondObject = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: [{
                name: 'android:layout_width',
                value: 'match_parent'
            },
                {
                    name: 'android:layout_height',
                    value: 'fill_parent'
                },
            ]
        };

        var firstObjectSorted = sort(firstObject);
        var secondObjectSorted = sort(secondObject);
        console.log('Before:')
        console.log(firstObject)
        console.log('After:')
        console.log(firstObjectSorted)
        console.log('=========================================================')
        console.log('Before:')
        console.log(secondObject)
        console.log('After:')
        console.log(secondObjectSorted)
        var comparison = _.isEqual(firstObjectSorted, secondObjectSorted);
        comparison.should.be.true

        done();
    })
})