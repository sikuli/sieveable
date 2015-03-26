var fs = require('fs'),
    chai = require('chai'),
    $ = require('cheerio'),
    _ = require('lodash')

var inspect = require('eyes').inspector()
chai.should()

var DB = require('../lib/db/index')

describe('db', function() {
    this.timeout(20000)

    it('can open', function() {

        return DB.open()
            .then(function(db) {
                db.should.have.property('env')
            })
    })

    it('can find using a combined query', function() {

        return DB.open()
            .then(function(db) {

                var q = {
                    listing: {
                        category: 'game'
                    },
                    ui: {
                        type: 'tag',
                        name: 'LinearLayout',
                        children: [{
                            type: 'tag',
                            name: 'ViewSwitcher',
                            count: 1
                        }]
                    }
                }

                return db.find(q)

            })
            .then(function(results) {
                // inspect(results)
                
            })
    })

    describe('findBy', function() {

        describe('example', function() {

            var env = {}

            var findBy = require('../lib/findBy/example')

            before(function() {
                return findBy
                    .init(env)
            })

            it('can init', function() {
                env.should.have.property('apps')
            })

            describe('can find', function() {

                it('LinearLayout and ViewSwitcher', function() {

                    var q = {
                        type: 'tag',
                        name: 'LinearLayout',
                        children: [{
                            type: 'tag',
                            name: 'ViewSwitcher',
                            count: 1
                        }]
                    }

                    var options = {
                        scope: _.range(1, 6)
                    }

                    findBy
                        .find(env, q, options)
                        .then(function(results) {
                            inspect(results)
                        })

                })
            })


        })


        describe('tagname', function() {

            var env = {}

            var findBy = require('../lib/findBy/tagname')

            before(function() {
                return findBy.init(env)
            })

            it('can init', function() {
                env.indexes.should.have.property('tagname')
            })

            describe('can find', function() {

                it('LinearLayout and ViewSwitcher', function() {

                    var q = {
                        type: 'tag',
                        name: 'LinearLayout',
                        children: [{
                            type: 'tag',
                            name: 'ViewSwitcher',
                            count: 1
                        }]
                    }

                    findBy
                        .find(env, q)
                        .then(function(results) {
                            // inspect(results)
                        })

                })

                it('ViewSwitcher', function() {

                    var q = {
                        type: 'tag',
                        name: 'ViewSwitcher'
                    }

                    findBy
                        .find(env, q)
                        .then(function(results) {
                            // inspect(results.length)
                        })

                })

                it('LinearLayout', function() {

                    var q = {
                        type: 'tag',
                        name: 'LinearLayout'
                    }

                    findBy
                        .find(env, q)
                        .then(function(results) {
                            // inspect(results.length)
                        })

                })

            })

        })

    })

})