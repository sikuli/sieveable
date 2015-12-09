'use strict';
const gulp = require('gulp'),
    path = require('path'),
    config = require('config'),
    through2 = require('through2'),
    mongo = require('../lib/db/mongo-client.js'),
    log = require('../lib/logger'),
    DATASET_PATH = path.resolve(__dirname + '/../', 'config', config.get('dataset.path')),
    collectionName = config.get('dbConfig.mongo.collections')[0].collection;

gulp.task('mongo:insertListing', (done) => {
    gulp.src(path.join(DATASET_PATH, 'listing', '*.json'))
        .pipe(new through2.obj((file, enc, cb) => {
            const doc = JSON.parse(file.contents);
            doc.id = doc.n + '-' + doc.verc;
            mongo.upsertOne(collectionName, doc, doc)
                .then(() => {
                    cb();
                })
                .error((e) => {
                    log.error('Error in insert:listing task: ' + e.message);
                });
        }, () => {
            done();
        }));
});

gulp.task('mongo:indexListing', (done) => {
    mongo.createIndex(collectionName, { id: 1 }, { unique: true })
        .then(() => {
            mongo.createIndexes(collectionName, [{
                key: { t: 'text',
                       desc: 'text',
                      new: 'text'
                    },
                weights: { t: 10,
                           desc: 5,
                           new: 1
                    },
                name: 'FullTextIndex'
            }],
              (err, res) => {
                  console.log(res);
                  done(err);
              }
            );
        });
});

gulp.task('mongo:close', () => {
    mongo.close();
});
