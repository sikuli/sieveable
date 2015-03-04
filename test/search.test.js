var db = require('../lib/db')

describe('db', function() {

    it('find apps with at least one particular tag', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'LinearLayout'
        }

        db.find(q, function(error, results) {

            console.log(results.length)
            done()
        })

    })


    it.skip('find apps with a LinearLayout that contains exactly one button', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 1
            }]
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with a LinearLayout that contains exactly two buttons', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 2
            }]
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with a LinearLayout that contains exactly two buttons and two image views', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'LinearLayout',
            children: [{
                type: 'tag',
                name: 'Button',
                count: 2
            }, {
                type: 'tag',
                name: 'ImageView',
                count: 2
            }]
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with two siblings that are a button and an image view', function(done) {
        this.timeout(0);
        var q = [{
            type: 'tag',
            name: 'Button',
            count: 1
        }, {
            type: 'tag',
            name: 'ImageView',
            count: 1
        }]

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with THREE siblings that are ONE button and TWO image views', function(done) {
        this.timeout(0);
        var q = [{
            type: 'tag',
            name: 'Button',
            count: 1
        }, {
            type: 'tag',
            name: 'ImageView',
            count: 2
        }]

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with AT LEAST 20 buttons', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'Button',
            min: 20
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with AT MOST 5 buttons', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'Button',
            max: 5
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })

    it('find apps with a TextView with android:fadingEdge="horizontal"', function(done) {
        this.timeout(0);
        var q = {
            type: 'tag',
            name: 'Button',
            attrbs: {
                'android:fadingEdge': 'horizontal'
            }
        }

        db.find(q, function(error, results) {
            console.log(results.length);
            done();
        });

    })
})