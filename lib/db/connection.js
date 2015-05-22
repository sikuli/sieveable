var Promise = require('bluebird');
var mongodb = require('mongodb');
var _ = require('lodash');
var util = require('util');
var MongoClient = Promise.promisifyAll(mongodb.MongoClient);
var config = require('config');
Promise.promisifyAll(mongodb.Collection.prototype);

var savedDBInstance

var dbConnection = _.once(function () {
    var dbConfig = config.get('dbConfig.mongo');
    var mongoURL = util.format('mongodb://%s:%s/%s', dbConfig.host, dbConfig.port,
        dbConfig.db);

    return MongoClient
        .connectAsync(mongoURL)

})

function getConnection() {
    if (savedDBInstance)
        return Promise.resolve(savedDBInstance)
    else
        return dbConnection()
            .then(function (db) {
                savedDBInstance = db
                return db
            })
}

var findOne = function (collectionName, query) {
    return getConnection()
        .then(function (db) {
            return db.collection(collectionName).findOneAsync(query);
        })
}

var find = function (collectionName, query, fields) {
    return getConnection()
        .then(function (db) {
            return db.collection(collectionName).findAsync(query, fields);
        })
}

var insertOne = function (collectionName, query) {
    return getConnection()
        .then(function (db) {
            return db.collection(collectionName).insertOneAsync(query);
        })
}

// Update or create a new document when no document matches the given query.
var upsertOne = function (collectionName, query, update) {
    return getConnection()
        .then(function (db) {
            return db.collection(collectionName).updateOneAsync(query,
                {$set: update}, {upsert: true});
        })
}

var createIndex = function (collectionName, keys, options) {
    return getConnection()
        .then(function (db) {
            return db.collection(collectionName)
                .createIndexAsync(keys, options);
        })
}

var close = function () {
    if (savedDBInstance)
        savedDBInstance.close()
}

module.exports = {
    find: find,
    findOne: findOne,
    insertOne: insertOne,
    upsertOne: upsertOne,
    createIndex: createIndex,
    close: close
};