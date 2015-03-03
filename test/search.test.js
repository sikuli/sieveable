var db = require('../lib/db')

describe('db', function() {

    it('find apps with at least one particular tag', function(done) {
        this.timeout(10000);
        var q = {
            type: 'tag',
            name: 'LinearLayout'
        }

        db.find(q, function(error, results){

            console.log(results.length)
            done()
        })

    })


    it.skip('find apps with a LinearLayout that contains exactly one button', function(done) {
        this.timeout(10000);
        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 1
            }]
        }

        db.find(q, function(error, results){
            console.log(results.length);
            done();
        });

    })

    it('find apps with a LinearLayout that contains exactly two buttons', function(done) {
        this.timeout(10000);
        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 3 
            }]
        }

        db.find(q, function(error, results){
             console.log(results.length);
             done();
        });

    })
})
