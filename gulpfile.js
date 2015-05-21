var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var glob = require("glob");
var byline = require('byline');
var through2 = require('through2');
var redis = require("redis");
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var uiIndex = require('./lib/findBy/tagname/searchIndex/build-stream');
var codeIndex = require('./lib/findBy/code/searchIndex/build-stream');
var Promise = require("bluebird");
var execAsync = Promise.promisify(exec);
var config = require("config");
var mongo = require('./lib/db/connection');
var DATASET_PATH = path.resolve(__dirname, 'config', config.get('dataset.path'));

gulp.task('index:ui', function () {
    gulp.src(path.join(DATASET_PATH, 'ui', '*.xml'))
        .pipe(uiIndex())
        .pipe(gulp.dest('indexes/tagname'));
});

gulp.task('solr:indexCode', function (callback) {
    glob(path.join(DATASET_PATH, 'code', '*.txt'), function (er, files) {
        codeIndex.index(files);
        callback();
    });
});

gulp.task('solr:commit', function () {
    codeIndex.commit();
});

gulp.task('extract:archives', function (done) {
    var untarListings = 'tar xvjf ' + path.join(DATASET_PATH, 'listing',
            'listing.tar.bz2') + ' -C ' + path.join(DATASET_PATH, 'listing');
    var untarUI = 'tar xvjf ' + path.join(DATASET_PATH, 'ui', 'ui-xml.tar.bz2') +
        ' -C ' + path.join(DATASET_PATH, 'ui');
    var untarManifest = 'tar xvjf ' + path.join(DATASET_PATH, 'manifest',
            'manifest.tar.bz2') + ' -C ' + path.join(DATASET_PATH,
            'manifest');
    var untarCode = 'tar xvjf ' + path.join(DATASET_PATH, 'code',
            'smali-invoked-methods.tar.bz2') + ' -C ' + path.join(DATASET_PATH,
            'code');

    console.log("Extracting listing details json files...");
    execAsync(untarListings)
        .then(function () {
            console.log("Extracting UI xml files...");
            return execAsync(untarUI);
        })
        .then(function () {
            console.log("Extracting Manifest xml files...");
            return execAsync(untarManifest);
        })
        .then(function () {
            console.log("Extracting code text files...");
            return execAsync(untarCode);
        })
        .then(function () {
            console.log("All archives have been extracted.");
            done();
        })
        .error(function (error) {
            console.error(error);
            done(error);
        });
});

gulp.task('start:db', function (callback) {
    try {
        fs.mkdirSync(path.resolve(DATASET_PATH, 'db'));
    } catch (error) {
        if (error.code != 'EEXIST') callback(error);
    }
    // start Solr in SolrCloud mode as a daemon
    var solr = 'solr start -cloud -V -h ' + config.get('dbConfig.solr.host') +
        ' -p ' + config.get('dbConfig.solr.port');
    console.log("Starting Solr server in SolrCloud mode. " + solr);
    exec(solr,
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(stderr);
        });
    // start Redis server
    var redis = 'redis-server ' + path.resolve(__dirname, 'config',
            config.get('dbConfig.redis.config'));
    console.log("Starting Redis server as a daemon process. " + redis);
    exec(redis,
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(stderr);
        });
    // start MongoDB
    var mongod = 'mongod --port ' + config.get('dbConfig.mongo.port') +
        ' --config ' + path.resolve(__dirname, 'config',
            config.get('dbConfig.mongo.config')) +
        ' --dbpath ' + path.join(DATASET_PATH, 'db');
    console.log("Starting MongoDB server: " + mongod);
    exec(mongod,
        function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(stderr);
        });
});

gulp.task('mongo:insertListing', function (done) {
    gulp.src(path.join(DATASET_PATH, 'listing', '*.json'))
        .pipe(new through2.obj(function (file, enc, cb) {
            var doc = JSON.parse(file.contents);
            doc['id'] = doc['n'] + '-' + doc['verc'];
            mongo.upsertOne('listings', doc, doc)
                .then(function () {
                    cb();
                })
                .error(function (e) {
                    console.error('Error in insert:listing task: ' + e.message);
                });
        }, function () {
            done();
        }));

});

gulp.task('redis:addKeys', function (done) {
    var client = redis.createClient();
    client.on("error", function (err) {
        console.error("Error " + err);
        throw (err);
    });

    var keysFile = path.resolve(__dirname, 'config', config.get('dataset.keysFile'));
    var key = config.get('dataset.keyName');
    var stream = fs.createReadStream(keysFile, {encoding: 'utf8'});
    stream = byline.createStream(stream);

    stream.on('data', function (line) {
        if (line.trim()) {
            console.log(key + " => " + line);
            client.sadd(key, line)
        }
    });
    stream.on('end', function () {
        client.quit();
        done();
    })
});

gulp.task('mongo:indexListing', function (done) {
    mongo.createIndex('listings', {id: 1}, {unique: true})
        .then(function () {
            done();
        })
        .error(function (e) {
            console.error('Error in mongoIndex task: ' + e.message);
        })
});

gulp.task('mongo:close', function () {
    mongo.close();
});


gulp.task('load:db', function (callback) {
    runSequence('mongo:insertListing', 'mongo:indexListing', 'mongo:close', callback)
});

gulp.task('default', function (callback) {
    runSequence('extract:archives', 'load:db', callback);
});