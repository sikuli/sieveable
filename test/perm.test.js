var fs = require('fs'),
    request = require('supertest'),
    parse = require('../lib/parse.js'),
    app = require('../lib/server/server'),
    chai = require("chai"),
    glob = require("glob"),
    inspect = require('eyes').inspector(),
    eyes = require('eyes');

//chai.use(require('chai-things'));
chai.should();

describe('Perm Examples', function () {


    //it('it should find an app with a call graph that starts with onRestart',
    //    function (done) {
    //        var perm_query = '<callpath from="onRestart"/>'
    //        var q = 'MATCH app\nWHERE\n' + perm_query + '\n RETURN app';
    //        var expected = [{
    //            id: "com.example.instantreplay-1",
    //            packageName: "com.example.instantreplay",
    //            version: "1"
    //        }]
    //        request(app)
    //            .get('/q/json')
    //            .query({queryText: q})
    //            .set('Accept', 'application/json')
    //            .expect(200)
    //            .end(function (err, res) {
    //                should.not.exist(err)
    //                should.exist(res.body)
    //                res.body.should.have.length(1)
    //                try {
    //                    res.body.should.include.something.that.deep.equals(expected[0])
    //                }
    //                catch (e) {
    //                    console.log('Expected:')
    //                    eyes.inspect(expected)
    //                    console.log('Actual:')
    //                    eyes.inspect(res.body)
    //                    throw e
    //                }
    //                done()
    //            });
    //    })


    //it('it should run independently',
    //    function () {
    //        var options = {scope: all}
    //        var query = '<callpath from="^on" uses-permission="AUDIO"></callpath>'
    //        return findByPerm
    //            .find(env, query, options)
    //            .then(function(results){
    //                inspect(results)
    //            })
    //
    //    })
})