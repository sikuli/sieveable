var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var exec = Promise.promisify(require('child_process').exec);
var config = require("config");

function SolrCollectionError(message) {
    this.message = message;
    this.name = "SolrCollectionError";
}
SolrCollectionError.prototype = Object.create(Error.prototype);
SolrCollectionError.prototype.constructor = SolrCollectionError;

function collectionExists(collectionName) {
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
function createCollection(collectionName) {
    return exec("solr create -c " + collectionName)
        .spread(function (stdout, stderr) {
            if (stderr) {
                throw new SolrCollectionError("Failed to create a new collection: "
                    + collectionName + ". Reason: " + stderr);
            }
            else {
                console.log(stdout);
                return Promise.resolve();
            }
        }).catch(function (e) {
            if (e.message.indexOf("already exists") > -1) {
                console.log("Collection " + collectionName + " already exists!");
                return Promise.resolve();
            }
            else {
                return Promise.reject(new SolrCollectionError(e.message));
            }
        })
}

//TODO: upload config to Zookeeper before creating a new collection
function createCollection_(collectionName) {
    var solrUrl = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") + '/solr/admin/collections';
    return request.postAsync({
        url: solrUrl,
        qs: {
            action: 'CREATE', name: collectionName, numShards: 1,
            replicationFactor: 1, maxShardsPerNode: 1,
            "collection.configName": collectionName, wt: 'json'
        },
        json: true
    }).spread(function (response, body) {
        if (response.statusCode == 200 && body.responseHeader.status == 0) {
            console.log("Solr collection " + collectionName + " has been created");
            return Promise.resolve();
        }
        else if (body.error.code == 400 &&
            body.error.msg.indexOf("already exists") > -1) {
            console.log("Solr collection " + collectionName + " already exists.");
            return Promise.resolve();
        }
        else {
            throw new SolrCollectionError("Failed to create a new collection: "
                + collectionName + ". Reason: " + body.error.msg);
        }
    }).catch(function (e) {
        return Promise.reject(new SolrCollectionError(e.message));
    })
}

function addField(collection, field) {
    var solrUrl = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") + '/solr/' + collection + "/schema";
    return request.postAsync({
        url: solrUrl,
        json: {"add-field": field}
    }).spread(function (response, body) {
            if (response.statusCode == 200 && body.responseHeader.status === 0) {
                if (!body.errors) {
                    console.log("Field: " + field.name + " has been created in collection: "
                        + collection);
                    return Promise.resolve();
                }
                else if (body.errors.length > 0 &&
                    body.errors[0].errorMessages.toString().indexOf('already exists') > -1) {
                    console.log("Collection: " + collection + ", "
                        + body.errors[0].errorMessages.toString());
                    return Promise.resolve();
                }
                else {
                    throw new SolrCollectionError("Failed to create a new field (" + field.name + ") in collection: "
                        + collection + ". Reason: " + body.errors[0].errorMessages.toString());
                }
            }
            else {
                throw new SolrCollectionError("Failed to create a new field (" + field.name + ") in collection: "
                    + collection + ". Reason: " + body.errors[0].errorMessages.toString());
            }
        }
    )
        .catch(function (e) {
            return Promise.reject(new SolrCollectionError(e.message));
        })
}

module.exports = {
    exists: collectionExists, createCollection: createCollection,
    addField: addField
};