var Promise = require('bluebird'),
    mongodb = require('mongodb'),
    _ = require('lodash'),
    util = require('util');
var MongoClient = Promise.promisifyAll(mongodb.MongoClient);
Promise.promisifyAll(mongodb.Collection.prototype);

var savedDBInstance

var dbConnection = _.once(function (context) {
    this._host = context.host || 'localhost';
    this._port = context.port || '27017';
    this._db = context.db || 'apps';

    var mongoURL = util.format('mongodb://%s:%s/%s', this._host, this._port, this._db);

    return MongoClient
        .connectAsync(mongoURL)

})

function getDB() {
    if (savedDBInstance)
        return savedDBInstance
    else
        return dbConnection({
            host: 'localhost',
            db: 'apps'
        }).then(function (db) {
            savedDBInstance = db
            return db
        })
}

var findListing = function (q) {

    return getDB()
        .then(function (db) {
            return db.collection("listings").findOneAsync(q
            )
        })
}

var close = function () {
    if (savedDBInstance)
        savedDBInstance.close()
}

module.exports = {
    findListing: findListing,
    close: close
};