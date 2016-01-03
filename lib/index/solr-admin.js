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
    const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') + '/solr/admin/collections';
    return request.postAsync({
        headers: { 'content-type': 'application/json' },
        url: solrUrl,
        qs: { action: 'CREATE', name: collectionName, numShards: 1, wt: 'json' }
    }).spread((response, body) => {
        const resObj = JSON.parse(body);
        if (response.statusCode !== 200) {
            if (resObj.error.msg.indexOf('already exists') > -1) {
                console.log('Collection ' + collectionName + ' already exists!');
                return Promise.resolve('already exists');
            }
            throw new Error('Failed to create collection: '
                + collectionName + '. Reason: ' + body);
        }
        if (resObj.responseHeader.status !== 0) {
            throw new SolrCollectionError('Failed to create a new collection ' +
                  collectionName + '. Reason ' + body.error);
        }
        return Promise.resolve('created');
    }).catch((e) => {
        return Promise.reject(e);
    });
};

exports.addField = function addField(collection, field) {
    const solrUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') + '/solr/' + collection + '/schema';
    return request.postAsync({
        url: solrUrl,
        json: { 'add-field': field }
    }).spread((response, body) => {
        if (response.statusCode === 200 && body.responseHeader.status === 0) {
            if (body.errors === undefined) {
                console.log('Field: ' + field.name + ' has been created in collection: '
                        + collection);
                return Promise.resolve('field created');
            }
            else if (body.errors.length > 0 &&
                    body.errors[0].errorMessages.toString().indexOf('already exists') > -1) {
                console.log(body.errors[0].errorMessages.toString());
                return Promise.resolve('already exists');
            }
        }
        throw new SolrCollectionError('Failed to create a new field (' + field.name + ') in collection: '
                    + collection + '. Reason: ' + body.errors[0].errorMessages.toString());
    })
      .catch((e) => {
          return Promise.reject(new SolrCollectionError(e.message));
      });
};
