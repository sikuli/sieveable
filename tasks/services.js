'use strict';
const gulp = require('gulp'),
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    execAsync = Promise.promisify(exec),
    config = require('config'),
    log = require('../lib/logger'),
    DATASET_PATH = path.resolve(__dirname + '/../', 'config', config.get('dataset.path'));


function startSolr() {
    const solrStatus = 'solr status',
        // start Solr in SolrCloud mode as a daemon
        solrHost = config.get('dbConfig.solr.host'),
        solrPort = config.get('dbConfig.solr.port'),
        solrStart = 'solr start -cloud -V -h ' + solrHost +
                    ' -p ' + solrPort;
    log.info('Starting Solr server in SolrCloud mode. ');
    return new Promise((resolve, reject) => {
        execAsync(solrStatus).then((stdout) => {
            if (stdout && stdout.indexOf('on port ' + solrPort)) {
                log.info('Solr is already running on ' + solrPort);
                return true;
            }
            return false;
        }).then((solrIsRunning) => {
            if (solrIsRunning) {
                resolve();
            }
            else {
                return execAsync(solrStart)
                    .then((stdout, stderr) => {
                        if (stderr) {
                            reject(new Error('Failed to start Solr\n' + stderr));
                        }
                        else {
                            resolve();
                        }
                    });
            }
        });
    });
}

function startRedis() {
    // start Redis server
    const redisStart = 'redis-server ' + path.resolve(__dirname + '/../', 'config',
            config.get('dbConfig.redis.config'));
    log.info('Starting Redis server as a daemon process. ');
    return new Promise((resolve, reject) => {
        execAsync(redisStart)
            .then((stdout, stderr) => {
                if (stderr) {
                    throw new Error('Failed to start redis ' + stderr);
                }
                resolve();
            }).catch((e) => {
                reject(e);
            });
    });
}

gulp.task('start:db', (callback) => {
    try {
        fs.mkdirSync(path.resolve(DATASET_PATH, 'db'));
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            callback(error);
        }
    }

    startSolr()
        .then(() => {
            return startRedis();
        })
        .catch((e) => {
            log.error(e.message);
            callback(e);
        });
});
