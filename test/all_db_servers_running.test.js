var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var mongodb = require('mongodb');
var config = require("config");
var util = require('util');
var redis = require("redis");
var _ = require("lodash");
var chai = require("chai");
var should = chai.should();
var MongoClient = mongodb.MongoClient;

function SolrCollectionError(collectionName) {
    this.message = "Collection " + collectionName + " does not exists.";
    this.name = "SolrCollectionError";
}
SolrCollectionError.prototype = Object.create(Error.prototype);
SolrCollectionError.prototype.constructor = SolrCollectionError;

function checkSolrCollectionExists(collectionName) {
    var solrUrl = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") + '/solr/admin/collections';
    return request.getAsync({
        url: solrUrl,
        qs: {action: 'LIST', wt: 'json'}
    }).spread(function (response, body) {
        response.statusCode.should.be.equal(200);
        var resObj = JSON.parse(body);
        resObj.responseHeader.status.should.be.equal(0);
        resObj.collections.should.include(collectionName);
        console.log("Collection " + collectionName + " exists.");
        return Promise.resolve();
    }).catch(function () {
        return Promise.reject(new SolrCollectionError("Collection " + collectionName +
            " does not exists."));
    })
}

describe("Test that all external db servers are running using their " +
    "respected configuration options.", function () {

    it('It should ensure that Solr is running all the collections defined ' +
        'in the config file exist.', function (done) {
        var collections = [config.get("dbConfig.solr.uiTagCollection"),
            config.get("dbConfig.solr.uiTagH1Collection"),
            config.get("dbConfig.solr.manifestCollection"),
            config.get("dbConfig.solr.codeCollection")];
        Promise.all([checkSolrCollectionExists(collections[0]),
            checkSolrCollectionExists(collections[1]),
            checkSolrCollectionExists(collections[2]),
            checkSolrCollectionExists(collections[3])])
            .then(function () {
                done();
            })
            .catch(SolrCollectionError, function (e) {
                console.error("ERROR: " + e.message);
                throw e;
            })
    })

    it('It should ensure that Redis is running at localhost:6379 ' +
        'and has all the keys defined in the config file.', function (done) {
        var dbConfig = config.get('dbConfig.redis');
        var datasetConfig = config.get('dataset');
        var keys = [datasetConfig.keyName, datasetConfig.uiKeyName,
            datasetConfig.manifestKeyName, datasetConfig.codeKeyName];
        var client = redis.createClient();
        client.on('ready', function () {
            _.forEach(keys, function (key, idx) {
                client.EXISTS(key, function (err, res) {
                    res.should.equal(1);
                    if (idx == keys.length - 1) {
                        client.quit();
                        done();
                    }
                });
            })
        })
        client.on('error', function (error) {
            client.quit();
            throw new Error("Redis client error " + client.host + ":" +
                client.port + " - " + error);
        })
    })

    it('It should ensure that MongoDB is running and has docs in all the ' +
        'collections defined in the config file.', function (done) {
        var dbConfig = config.get('dbConfig.mongo');
        var mongoURL = util.format('mongodb://%s:%s/%s', dbConfig.host,
            dbConfig.port, dbConfig.db);
        MongoClient.connect(mongoURL, function (error, db) {
            should.not.exist(error);
            var name = db.databaseName;
            var collectionNames = _.pluck(dbConfig.collections, 'collection');
            _.forEach(collectionNames, function (name, key) {
                var collection = db.collection(name);
                collection.count(function (err, count) {
                    should.not.exist(err);
                    count.should.be.above(0);
                    if (key === collectionNames.length - 1) {
                        db.close();
                        done();
                    }
                });
            });
        });

    })
})