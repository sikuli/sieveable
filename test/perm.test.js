var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    should = require('should'),
    chai = require("chai"),
    glob = require("glob"),
    inspect = require('eyes').inspector();

chai.use(require('chai-things'));
chai.should();

var findByPerm = require('../lib/findBy/perm')
var findByDataset = require('../lib/findBy/dataset')


describe('#Perm' , function () {

    var env = {
        apps: require('../lib/db/apps')
    }
    var all

    before(function(){

        return findByDataset
            .find(env, {name: 'apac'})
            .then(function(items){
                all = items
            })
    })

    //it('it should integrate well with the whole thing',
    //    function (done) {
    //        var listing_query = '<callpath from="^on" uses-permission="AUDIO"></callpath>'
    //        var q = 'MATCH app\nWHERE\n' + listing_query + '\n RETURN app';
    //        var expected = []
    //        request(app)
    //            .get('/q/json')
    //            .query({queryText: q})
    //            .set('Accept', 'application/json')
    //            .expect(200)
    //            .end(function (err, res) {
    //                should.not.exist(err)
    //                should.exist(res.body)
    //                res.body.should.have.length(10)
    //                done()
    //            });
    //    })


    it('it should run independently',
        function () {
            var options = {scope: all}
            var query = '<callpath from="^on" uses-permission="AUDIO"></callpath>'
            return findByPerm
                .find(env, query, options)
                .then(function(results){
                    inspect(results)
                })

        })
})