'use strict';
const Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    exec = Promise.promisify(require('child_process').exec),
    _ = require('lodash'),
    config = require('config');

function SolrCollectionError(message) {
    this.message = message;
    this.name = 'SolrCollectionError';
}
SolrCollectionError.prototype = Object.create(Error.prototype);
SolrCollectionError.prototype.constructor = SolrCollectionError;

exports.exists = function collectionExists(collectionName) {
    const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') + '/solr/admin/collections';
    return request.getAsync({
        url: solrUrl,
        qs: { action: 'LIST', wt: 'json' }
    }).spread((response, body) => {
        if (response.statusCode !== 200) {
            throw new Error('Failed to find collection: '
                + collectionName + '. Reason: ' + body.error.msg);
        }
        const resObj = JSON.parse(body);
        if (resObj.responseHeader.status !== 0) {
            throw new SolrCollectionError('Solr LIST action has failed. Reason ' +
               body.error.msg);
        }
        if (_.indexOf(resObj.collections, collectionName) === -1) {
            throw new SolrCollectionError('Solr collection ' + collectionName +
               ' does not exist.');
        }
        console.log('Collection ' + collectionName + ' exists.');
        return Promise.resolve();
    }).catch((e) => {
        return Promise.reject(e);
    });
};

exports.createCollection = function createCollection(collectionName) {
    return exec('solr create -c ' + collectionName)
        .spread((stdout, stderr) => {
            if (stderr) {
                throw new SolrCollectionError('Failed to create a new collection: '
                    + collectionName + '. Reason: ' + stderr);
            }
            if (stdout && stdout.indexOf('failure":') > -1) {
                throw new SolrCollectionError(stdout);
            }
            else {
                console.log(stdout);
                return Promise.resolve();
            }
        }).catch((e) => {
            if (e.message.indexOf('already exists') > -1) {
                console.log('Collection ' + collectionName + ' already exists!');
                return Promise.resolve();
            }
            else {
                return Promise.reject(new SolrCollectionError(e.message));
            }
        });
};

// TODO: upload config to Zookeeper before creating a new collection
function createCollection_(collectionName) {
    const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') + '/solr/admin/collections';
    return request.postAsync({
        url: solrUrl,
        qs: {
            action: 'CREATE', name: collectionName, numShards: 1,
            replicationFactor: 1, maxShardsPerNode: 1,
            'collection.configName': collectionName, wt: 'json'
        },
        json: true
    }).spread((response, body) => {
        if (response.statusCode === 200 && body.responseHeader.status === 0) {
            console.log('Solr collection ' + collectionName + ' has been created');
            return Promise.resolve();
        }
        else if (body.error.code === 400 &&
            body.error.msg.indexOf('already exists') > -1) {
            console.log('Solr collection ' + collectionName + ' already exists.');
            return Promise.resolve();
        }
        else {
            throw new SolrCollectionError('Failed to create a new collection: '
                + collectionName + '. Reason: ' + body.error.msg);
        }
    }).catch((e) => {
        return Promise.reject(new SolrCollectionError(e.message));
    });
}

exports.addField = function addField(collection, field) {
    const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') + '/solr/' + collection + '/schema';
    return request.postAsync({
        url: solrUrl,
        json: { 'add-field': field }
    }).spread((response, body) => {
        if (response.statusCode === 200 && body.responseHeader.status === 0) {
            if (!body.errors) {
                console.log('Field: ' + field.name + ' has been created in collection: '
                        + collection);
                return Promise.resolve();
            }
            else if (body.errors.length > 0 &&
                    body.errors[0].errorMessages.toString().indexOf('already exists') > -1) {
                console.log('Collection: ' + collection + ', '
                        + body.errors[0].errorMessages.toString());
                return Promise.resolve();
            }
            else {
                throw new SolrCollectionError('Failed to create a new field (' + field.name + ') in collection: '
                        + collection + '. Reason: ' + body.errors[0].errorMessages.toString());
            }
        }
        else {
            throw new SolrCollectionError('Failed to create a new field (' + field.name + ') in collection: '
                    + collection + '. Reason: ' + body.errors[0].errorMessages.toString());
        }
    })
      .catch((e) => {
          return Promise.reject(new SolrCollectionError(e.message));
      });
};
