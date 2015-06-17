var gulp = require('gulp');
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var execAsync = Promise.promisify(exec);
var config = require('config');
var log = require("../lib/logger");
var DATASET_PATH = path.resolve(__dirname + "/../", 'config', config.get('dataset.path'));


function startSolr() {
    var solrStatus = 'solr status';
    // start Solr in SolrCloud mode as a daemon
    var solrHost = config.get('dbConfig.solr.host');
    var solrPort = config.get('dbConfig.solr.port');
    var solrStart = 'solr start -cloud -V -h ' + solrHost +
        ' -p ' + solrPort;
    log.info("Starting Solr server in SolrCloud mode. ");
    return new Promise(function (resolve, reject) {
            execAsync(solrStatus).then(function (stdout) {
                if (stdout && stdout.indexOf('on port ' + solrPort)) {
                    log.info("Solr is already running on " + solrPort);
                    return true;
                }
                else {
                    return false;
                }
            }).then(function (solrIsRunning) {
                if (solrIsRunning) {
                    resolve()
                }
                else {
                    return execAsync(solrStart)
                        .then(function (stdout, stderr) {
                            if (stderr) {
                                reject(new Error("Failed to start Solr\n" + stderr));
                            }
                            else {
                                resolve()
                            }
                        })
                }
            })
        }
    )
}

function startRedis() {
    // start Redis server
    var redisStart = 'redis-server ' + path.resolve(__dirname + "/../", 'config',
            config.get('dbConfig.redis.config'));
    log.info("Starting Redis server as a daemon process. ");
    return new Promise(function (resolve, reject) {
        execAsync(redisStart)
            .then(function (stdout, stderr) {
                if (stderr) {
                    throw new Error("Failed to start redis " + stderr);
                }
                resolve();
            }).catch(function (e) {
                reject(e);
            })
    });
}

function startMongoDB() {
    // start MongoDB
    var mongod = 'mongod --port ' + config.get('dbConfig.mongo.port') +
        ' --config ' + path.resolve(__dirname + "/../", 'config',
            config.get('dbConfig.mongo.config')) +
        ' --dbpath ' + path.join(DATASET_PATH, 'db');
    log.info("Starting MongoDB server.");
    return new Promise(function (resolve, reject) {
        execAsync(mongod).then(function (stderr, stdout) {
            if (stderr) {
                throw new Error(stderr);
            }
            else {
                log.info(stdout);
                log.info("MongoDB server is running now and this process will remain running.");
                resolve(stdout);
            }
        }).catch(function (e) {
            reject(new Error(" Failed to start MongoDB. Please ensure that " +
                "MongoDB is not already running or port number " +
                config.get('dbConfig.mongo.port') + " is not " +
                " already being used. \n" + e.message));
        })
    });
}

gulp.task('start:db', function (callback) {
    try {
        fs.mkdirSync(path.resolve(DATASET_PATH, 'db'));
    } catch (error) {
        if (error.code != 'EEXIST') callback(error);
    }

    startSolr()
        .then(function () {
            return startRedis()
        }).then(function () {
            return startMongoDB();
        })
        .catch(function (e) {
            log.error(e.message);
            callback(e);
        })

});
