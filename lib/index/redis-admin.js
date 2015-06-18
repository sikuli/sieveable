var config = require("config");
var Promise = require("bluebird");
var _ = require("lodash");
var redis = require("redis");
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

function insertSolrKeys(key, solrCollection) {
    var redisClient = redis.createClient();
    redisClient.on("error", function (err) {
        log.error("Error " + err);
        throw (err);
    });

    return new Promise(function (resolve, reject) {
        getSolrIds(solrCollection)
            .then(function (ids) {
                _.forEach(ids, function (id) {
                    log.info(key + " => " + id);
                    redisClient.SADD(key, id);
                })
                return key;
            })
            .then(function () {
                redisClient.quit();
                resolve();
            })
            .catch(function (e) {
                redisClient.quit();
                reject(new Error("Error in indexRedis. " + e.message));
            })
    });
}
// Insert the union of id values of all keys into one set that represents the
// entire unique apps in the dataset.
function insertDatasetKeys(datasetKey, keys) {
    var redisPromise = Promise.promisifyAll(redis);
    var redisClient = redisPromise.createClient();
    redisClient.on("error", function (err) {
        log.error("Error " + err);
        throw (err);
    });

    return Promise.map(keys, function (key) {
        return redisClient.SMEMBERSAsync(key)
            .then(function (ids) {
                var promises = [];
                _.forEach(ids, function (id) {
                    log.info(datasetKey + " => " + id);
                    promises.push(redisClient.sadd(datasetKey, id));
                })
                return Promise.all(promises).then(function () {
                    return Promise.resolve();
                }).catch(function (e) {
                    log.error('Failed to add keys to %s. %s', key, e.message);
                    return Promise.reject(e);
                })
            })
    }, {concurrency: 1}).then(function () {
        log.info("All dataset ids have been added to %s redis set.", datasetKey);
        redisClient.quit();
        return Promise.resolve();
    }).catch(function (e) {
        reject(e);
    });
}

module.exports = {
    insertSolrKeys: insertSolrKeys,
    insertDatasetKeys: insertDatasetKeys
};