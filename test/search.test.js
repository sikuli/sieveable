var db = require('../lib/db')

describe('db', function() {

    it('find apps with at least one particular tag', function() {

        var q = {
            type: 'tag',
            name: 'LinearLayout'
        }

        db.find(q)

    })


    it('find apps with a LinearLayout that contains exactly one button', function() {

        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button'
            }]
        }

        db.find(q)

    })
})