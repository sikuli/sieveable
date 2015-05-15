var fs = require('fs'),
    chai = require('chai'),
    $ = require('cheerio'),
    _ = require('lodash')

var inspect = require('eyes').inspector()
chai.should()

var DB = require('../lib/db/index')

describe('db', function () {
    this.timeout(20000)

    it('can open', function () {

        return DB.open()
            .then(function (db) {
                db.should.have.property('env')
            })
    })

    describe('findBy', function () {

        describe('example', function () {

            var env = {}

            var findBy = require('../lib/findBy/ui')

            before(function () {
                return findBy
                    .init(env)
            })

            it('can init', function () {
                env.should.have.property('apps')
            })

            describe('can find', function () {

                it('TEST: LinearLayout and ViewSwitcher', function () {

                    var q = '<LinearLayout><ViewSwitcher/></LinearLayout>';

                    var options = {
                        scope: ['com.sgiggle.production-1386724633',
                            'com.sgiggle.production-68',
                            'com.instagram.android-639564',
                            'com.google.android.apps.plus-413076433',
                            'com.cleanmaster.mguard-50511533']
                    }

                    findBy
                        .find(env, q, options)
                        .then(function (results) {
                            inspect(results)
                        })

                })
            })


        })


        describe('tagname', function () {

            var env = {}

            var findBy = require('../lib/findBy/tagname')

            before(function () {
                return findBy.init(env)
            })

            it('can init', function () {
                env.indexes.should.have.property('tagname')
            })

            describe('can find', function () {

                it('LinearLayout and ViewSwitcher', function () {

                    var q = '<LinearLayout><ViewSwitcher></ViewSwitcher></LinearLayout>';
                    var options = {
                        scope: ['com.sgiggle.production-1386724633',
                            'com.sgiggle.production-68',
                            'com.instagram.android-639564',
                            'com.google.android.apps.plus-413076433',
                            'com.cleanmaster.mguard-50511533']
                    }

                    findBy
                        .find(env, q, options)
                        .then(function (results) {
                            inspect(results)
                        })

                })

                it('ViewSwitcher', function () {

                    var q = '<ViewSwitcher/>';

                    findBy
                        .find(env, q)
                        .then(function (results) {
                            inspect(results.length)
                        })

                })

                it('LinearLayout', function () {

                    var q = '<LinearLayout/>';

                    findBy
                        .find(env, q)
                        .then(function (results) {
                            inspect(results.length)
                        })

                })

            })

        })

    })

})