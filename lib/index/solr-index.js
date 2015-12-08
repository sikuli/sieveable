'use strict';
const path = require('path'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    fs = require('fs'),
    config = require('config'),
    log = require('../logger');

function FileIndexingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = 'FileIndexingError';
    // Error.captureStackTrace(this, FaileIndexingError);
}
FileIndexingError.prototype = Object.create(Error.prototype);
FileIndexingError.prototype.constructor = FileIndexingError;

function index(fileNames, extention, collectionName, callback) {
    const solrExtractUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') +
        '/solr/' + collectionName + '/update/extract';
    log.info('Indexing %d files in the %s collection.', fileNames.length,
        collectionName);
    Promise.map(fileNames, (fileName) => {
        const appInfo = path.basename(fileName, extention).split('-'),
            packageName = appInfo[0],
            versionCode = appInfo[1],
            appId = packageName + '-' + versionCode,
            solrUpdateParams = {
                'literal.id': appId,
                'literal.package_name': packageName,
                'literal.version_code': Number(versionCode),
                'wt': 'json',
                my_file: {
                    value: fs.createReadStream(fileName),
                    options: { contentType: 'text/plain' }
                }
            };

        return request.postAsync({
            url: solrExtractUrl,
            formData: solrUpdateParams
        }).get(1)
            .then((body) => {
                const resHeader = JSON.parse(body).responseHeader;
                if (resHeader.status === 0) {
                    log.info('Successfully updated %s-%s', packageName,
                        versionCode);
                }
                else {
                    throw new FileIndexingError('File indexing failed. ' +
                        'Response Header: ' + JSON.stringify(resHeader), fileName);
                }
            })
            .catch(FileIndexingError, (e) => {
                log.error('Indexing error. ' + e.message);
            });
    }, { concurrency: 1 }).then(() => {
        return commit(collectionName);
    }).then(() => {
        callback(null);
    }).catch(FileIndexingError, (e) => {
        log.error('Failed to update %s. %s', e.fileName, e.message);
        callback(e);
    }).catch((e) => {
        callback(e);
    });
}

function commit(collectionName) {
    const solrUpdateUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
        config.get('dbConfig.solr.port') +
        '/solr/' + collectionName + '/update';
    // commit all pending updates
    return request.postAsync({
        headers: { 'content-type': 'application/json' },
        url: solrUpdateUrl,
        qs: { 'commit': 'true', 'wt': 'json' }
    }).get(1)
        .then((body) => {
            const resHeader = JSON.parse(body).responseHeader;
            if (resHeader.status === 0) {
                log.info('Successfully committed all pending operations.');
                // callback(null);
                return;
            }
            else {
                throw new Error('Failed to commit pending updates. Response: ' +
                    JSON.stringify(resHeader));
            }
        })
        .catch((e) => {
            log.error(e.message);
            return Promise.reject(e);
        });
}

module.exports = { index: index, commit: commit };
