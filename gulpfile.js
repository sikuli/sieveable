var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var glob = require("glob");
var byline = require('byline');
var mkdirp = require("mkdirp");
var through2 = require('through2');
var redis = require("redis");
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var Promise = require("bluebird");
var execAsync = Promise.promisify(exec);
var request = Promise.promisifyAll(require("request"));
var config = require("config");
var solrIndex = require('./lib/index/solr-index');
var solrAdmin = require('./lib/index/solr-admin');
var tagNameExtractor = require("./lib/index/tag-name-extractor");
var h1Extractor = require("./lib/index/h1-extractor");
var mongo = require('./lib/db/connection');
var DATASET_PATH = path.resolve(__dirname, 'config', config.get('dataset.path'));

gulp.task('extract:ui-tag', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUITagDir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), function (err, files) {
        tagNameExtractor(files, dir, "-ui-tag", function (e) {
            callback(e);
        });
    });

});

gulp.task('extract:ui-h1', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUIH1Dir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'ui', '*.xml'), function (err, files) {
        h1Extractor(files, dir, function (e) {
            callback(e);
        });
    });

});

gulp.task('extract:manifest', function (callback) {
    // create a directory that contains all extracted files.
    var dir = path.resolve(__dirname, 'config', config.get('index.extractManifestDir'));
    mkdirp.sync(dir, {mode: "2775"});
    // Extract tag names and attributes.
    glob(path.join(DATASET_PATH, 'manifest', '*.xml'), function (err, files) {
        tagNameExtractor(files, dir, "-manifest-tag", function (e) {
            callback(e);
        });
    });

});

gulp.task('solr:indexUITag', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUITagDir'));
    var collectionName = config.get("dbConfig.solr.uiTagCollection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-ui-tag.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexH1', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractUIH1Dir'));
    var collectionName = config.get("dbConfig.solr.uiTagH1Collection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-ui-h1.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexManifest', function (callback) {
    var dir = path.resolve(__dirname, 'config', config.get('index.extractManifestDir'));
    var collectionName = config.get("dbConfig.solr.manifestCollection");
    glob(path.join(dir, '*.txt'), function (err, files) {
        solrIndex.index(files, "-manifest-tag.txt", collectionName, function (e) {
            callback(e);
        });
    });
});

gulp.task('solr:indexCode', function (callback) {
    var collectionName = config.get("dbConfig.solr.codeCollection");
    glob(path.join(DATASET_PATH, 'code', '*.txt'), function (er, files) {
        solrIndex.index(files, ".smali.txt", collectionName, function (err) {
            callback(err);
        });
    });
});


gulp.task('solr:commit', function (callback) {
    var collectionName = config.get("dbConfig.solr.codeCollection");
    solrIndex.commit(collectionName, function (err) {
        callback(err);
    });
});

gulp.task('solr:create', function (callback) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];
    Promise.all([solrAdmin.createCollection(collections[0]),
        solrAdmin.createCollection(collections[1]),
        solrAdmin.createCollection(collections[2]),
        solrAdmin.createCollection(collections[3])])
        .then(function () {
            callback();
        })
        .catch(function (e) {
            console.error("ERROR: " + e.message);
            callback(e);
        })
});

gulp.task('solr:addField', function (callback) {
    var collections = [config.get("dbConfig.solr.uiTagCollection"),
        config.get("dbConfig.solr.uiTagH1Collection"),
        config.get("dbConfig.solr.manifestCollection"),
        config.get("dbConfig.solr.codeCollection")];
    var packageField = {
        "name": "package_name",
        "type": "string",
        "indexed": true,
        "required": true,
        "stored": true
    };
    var versionCodeField = {
        "name": "version_code",
        "type": "int",
        "indexed": true,
        "required": true,
        "stored": true
    };

    Promise.all([
        solrAdmin.addField(collections[0], packageField),
        solrAdmin.addField(collections[0], versionCodeField),
        solrAdmin.addField(collections[1], packageField),
        solrAdmin.addField(collections[1], versionCodeField),
        solrAdmin.addField(collections[2], packageField),
        solrAdmin.addField(collections[2], versionCodeField),
        solrAdmin.addField(collections[3], packageField),
        solrAdmin.addField(collections[3], versionCodeField),
    ])
        .then(function () {
            callback();
        })
        .catch(function (e) {
            console.error("ERROR: " + e.message);
            callback(e);
        })
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
    var redisClient = redis.createClient();
    redisClient.on("error", function (err) {
        console.error("Error " + err);
        throw (err);
    });
    var keysFile = path.resolve(__dirname, 'config', config.get('dataset.keysFile'));
    var key = config.get('dataset.keyName');
    var indexKeysFile = path.resolve(__dirname, 'config', config.get('dataset.indexKeysFile'));
    var indexKey = config.get('dataset.indexKeyName');
    var uiKeysFile = path.resolve(__dirname, 'config', config.get('dataset.uiKeysFile'));
    var uiKey = config.get('dataset.uiKeyName');
    var manifestKeysFile = path.resolve(__dirname, 'config', config.get('dataset.manifestKeysFile'));
    var manifestKey = config.get('dataset.manifestKeyName');
    var codeKeysFile = path.resolve(__dirname, 'config', config.get('dataset.codeKeysFile'));
    var codeKey = config.get('dataset.codeKeyName');

    Promise.join(
        indexRedis(key, keysFile, redisClient),
        indexRedis(indexKey, indexKeysFile, redisClient),
        indexRedis(uiKey, uiKeysFile, redisClient),
        indexRedis(manifestKey, manifestKeysFile, redisClient),
        indexRedis(codeKey, codeKeysFile, redisClient), function () {
            console.log('All keys and values have been added to redis.')
            redisClient.quit();
            done();
        }
    )


});

function indexRedis(key, textFile, redisClient) {
    return new Promise(function (resolve, reject) {
        var stream = fs.createReadStream(textFile, {encoding: 'utf8'});
        stream = byline.createStream(stream);
        stream.on('data', function (line) {
            if (line.trim()) {
                console.log(key + " => " + line);
                redisClient.sadd(key, line)
            }
        });
        stream.on('end', function () {
            resolve();
        })
        stream.on('error', function () {
            reject(new TypeError("Error in indexRedis"));
        })
    })

}

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
    runSequence('mongo:insertListing', 'mongo:indexListing', 'mongo:close', 'redis:addKeys', callback)
});

gulp.task('solr:index', function (callback) {
    runSequence('extract:ui-tag', 'extract:ui-h1', 'extract:manifest',
        'solr:indexUITag', 'solr:indexH1', 'solr:indexManifest',
        'solr:indexCode', 'solr:commit', callback)
});

gulp.task('default', function (callback) {
    runSequence('solr:create', 'solr:addField', 'extract:archives', 'load:db', 'solr:index', callback);
});