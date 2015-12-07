'use strict';
const Promise = require('bluebird'),
    mongodb = require('mongodb'),
    _ = require('lodash'),
    util = require('util'),
    MongoClient = Promise.promisifyAll(mongodb.MongoClient),
    config = require('config');
Promise.promisifyAll(mongodb.Collection.prototype);

let savedDBInstance = {};
const dbConnection = _.once(() => {
    const dbConfig = config.get('dbConfig.mongo'),
        mongoURL = util.format('mongodb://%s:%s/%s', dbConfig.host, dbConfig.port,
                               dbConfig.db);
    return MongoClient
        .connectAsync(mongoURL);
});

function getConnection() {
    if (savedDBInstance) {
        return Promise.resolve(savedDBInstance);
    }
    return dbConnection()
        .then((db) => {
            savedDBInstance = db;
            return db;
        });
}

exports.findOne = function findOne(collectionName, query) {
    return getConnection()
        .then((db) => {
            return db.collection(collectionName).findOneAsync(query);
        });
};

exports.find = function find(collectionName, query, fields) {
    return getConnection()
        .then((db) => {
            return db.collection(collectionName).findAsync(query, fields);
        });
};

exports.insertOne = function insertOne(collectionName, query) {
    return getConnection()
        .then((db) => {
            return db.collection(collectionName).insertOneAsync(query);
        });
};

// Update or create a new document when no document matches the given query.
exports.upsertOne = function upsertOne(collectionName, query, update) {
    return getConnection()
        .then((db) => {
            return db.collection(collectionName).updateOneAsync(query,
                { $set: update }, { upsert: true });
        });
};

exports.createIndex = function createIndex(collectionName, field, options) {
    return getConnection()
        .then((db) => {
            return db.collection(collectionName)
                .createIndexAsync(field, options);
        }).then(() => {
            console.log('An index has been created on the field %s.',
                Object.keys(field)[0]);
        }).catch((e) => {
            console.error('Error: Failed to create an index on the field %s.' +
                ' Reason: ' + e.message, Object.keys(field)[0]);
            throw e;
        });
};

exports.createIndexes = function createIndexes(collectionName, indexSpecs, callback) {
    return getConnection()
        .then((db) => {
            db.collection(collectionName)
                .createIndexes(indexSpecs, (err, res) => {
                    if (err) {
                        console.error('Error: Failed to create multiple indexes on the' +
                            ' fields %s. Reason: %s', Object.keys(indexSpecs[0]).join(', '),
                            err.message);
                        callback(err);
                    } else {
                        console.log('Multiple indexes have been created on the fields %s.',
                            Object.keys(indexSpecs[0]).join(', '));
                        console.log('Response: ' + JSON.stringify(res));
                        callback(null, res);
                    }
                });
        });
};

exports.close = function close() {
    if (savedDBInstance) {
        savedDBInstance.close();
    }
};
