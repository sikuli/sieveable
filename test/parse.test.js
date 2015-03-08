var chai = require('chai')

chai.should()

var parse = require('../lib/parse')

describe('parse', function () {

    it('the simplest query', function () {

        var q = '<LinearLayout></LinaerLayout>'
        var actual = parse(q)
        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: {}
        }

        actual.should.deep.equal(expected)

    })

    it('A simple tag with an attribute', function () {
        var q = '<LinearLayout android:layout_width="match_parent"/>'
        var actual = parse(q)
        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: [{
                name: 'android:layout_width',
                value: 'match_parent'
            }
            ]
        }
        actual.should.deep.equal(expected)
    })

    it('a parent-child relationship', function () {

        var q = '<LinearLayout><Button></Button></LinaerLayout>'

        var actual = parse(q)

        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: {},
            children: [{
                type: 'tag',
                name: 'Button',
                attributes: {}
            }]
        }

        actual.should.deep.equal(expected)

    })

    it('a parent with exactly two children', function () {

        var q = '<LinearLayout><Button></Button><Button></Button></LinaerLayout>'

        var actual = parse(q)

        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: {},
            children: [{
                type: 'tag',
                name: 'Button',
                attributes: {}
            },
                {
                    type: 'tag',
                    name: 'Button',
                    attributes: {}
                },
            ]
        }
        actual.should.deep.equal(expected)
    })

    it('a parent with exactly two children with all tags have attributes', function () {

        var q = '<LinearLayout android:layout_width="match_parent"' +
            ' android:layout_height="match_parent"> ' +
            '<Button android:text="@string/send"/> ' +
            '<Button android:layout_width="100dp"' +
            ' android:layout_height="wrap_content"' +
            ' android:layout_gravity="right"/>' +
            '</LinaerLayout>'
        var actual = parse(q)
        var expected = {
            type: 'tag',
            name: 'LinearLayout',
            attributes: [{
                name: 'android:layout_width', value: 'match_parent'
            },
                {name: 'android:layout_height', value: 'match_parent'}
            ],
            children: [{
                type: 'tag',
                name: 'Button',
                attributes: [{name: 'android:text', value: '@string/send'}]
            },
                {
                    type: 'tag',
                    name: 'Button',
                    attributes: [{
                        name: 'android:layout_width',
                        value: '100dp'
                    },
                        {name: 'android:layout_height', value: 'wrap_content'},
                        {name: 'android:layout_gravity', value: 'right'}
                    ]
                }]
        }

        actual.should.deep.equal(expected)

    })

})