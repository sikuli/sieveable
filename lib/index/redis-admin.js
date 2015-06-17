var config = require("config");
var Promise = require("bluebird");
var _ = require("lodash");
var request = Promise.promisifyAll(require("request"));
var log = require("../logger");

function getSolrIds(collectionName) {
    var solrConfig = config.get("dbConfig.solr");
    var maxRows = solrConfig.maxRows;
    var reqURL = "http://" + solrConfig.host + ":" + solrConfig.port +
        "/solr/" + collectionName + "/query";
    var reqObj = {
        url: reqURL,
        qs: {q: "id:*", wt: "json", rows: maxRows, fl: 'id'}
    };

    function clientError(e) {
        return e.code >= 400 && e.code < 500;
    }

    return request.getAsync(reqObj)
        .get(1)
        .then(function (body) {
            var docs = JSON.parse(body).response.docs;
            return Promise.resolve(_.pluck(docs, 'id'));
        })
        .catch(clientError, function (e) {
            log.error(e);
            return Promise.reject(e);
        });
}

function insertSet(key, solrCollection, redisClient) {
    return new Promise(function (resolve, reject) {
        getSolrIds(solrCollection)
            .then(function (ids) {
                _.forEach(ids, function (id) {
                    log.info(key + " => " + id);
                    redisClient.sadd(key, id);
                })
                return key;
            })
            .then(function () {
                resolve();
            })
            .catch(function (e) {
                reject(new Error("Error in indexRedis. " + e.message));
            })
    });
}
// Insert the union of id values of all keys into one set that represents the
// entire unique apps in the dataset.
function insertUnion(datasetKey, redisClient) {
    return new Promise(function (resolve, reject) {
        try {
            redisClient.keys('*', function (err, keys) {
                if (err) {
                    reject(new Error("Failed tp find all keys in redis."));
                }
                _.forEach(keys, function (key) {
                    _.forEach(redisClient.smembers(key), function (id) {
                        log.info(key + " => " + id);
                        redisClient.sadd(datasetKey, id);
                    })
                })
                return resolve();
            });

        }
        catch (err) {
            reject(err);
        }
    });
}

module.exports = {insertSet: insertSet, insertUnion: insertUnion};