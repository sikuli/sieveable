'use strict';
const path = require('path'),
  Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request')),
  fs = require('fs'),
  _ = require('lodash'),
  config = require('config'),
  log = require('../logger');

exports.commit = function commit(collectionName) {
  const solrUpdateUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
    config.get('dbConfig.solr.port') +
    '/solr/' + collectionName + '/update';
  // commit all pending updates
  return request.postAsync({ headers: { 'content-type': 'application/json' },
      url: solrUpdateUrl,
      qs: {
        'commit': 'true',
        'wt': 'json'
      }
    })
    .get(1)
    .then((body) => {
      const resHeader = JSON.parse(body)
        .responseHeader;
      if (resHeader.status === 0) {
        log.info('Successfully committed index changes for collection ',
          collectionName);
        return Promise.resolve('done');
      }
      throw new Error('Failed to commit index changes for collection' +
        collectionName + '. Response: ' + JSON.stringify(resHeader));
    })
    .catch((e) => {
      log.error('Failed to commit changes to %s.', collectionName, e);
      return Promise.reject(e);
    });
};

function FileIndexingError(message, fileName) {
  this.message = message;
  this.fileName = fileName;
  this.name = 'FileIndexingError';
  // Error.captureStackTrace(this, FaileIndexingError);
}
FileIndexingError.prototype = Object.create(Error.prototype);
FileIndexingError.prototype.constructor = FileIndexingError;

exports.indexFile = function indexFile(fileNames, extention, collectionName) {
  const solrExtractUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
    config.get('dbConfig.solr.port') +
    '/solr/' + collectionName + '/update/extract';
  log.info('Indexing %d files in the %s collection.', fileNames.length,
    collectionName);
  return Promise.map(fileNames, (fileName) => {
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
          options: {
            contentType: 'text/plain'
          }
        }
      };

    return request.postAsync({ url: solrExtractUrl, formData: solrUpdateParams })
        .get(1)
        .then((body) => {
          const resHeader = JSON.parse(body)
            .responseHeader;
          if (resHeader.status === 0) {
            log.info('Successfully updated %s-%s', packageName,
              versionCode);
          }
          else {
            throw new FileIndexingError('File indexing failed for ' +
              fileName + ' Response: ' + JSON.stringify(body));
          }
        })
        .catch(FileIndexingError, (e) => {
          log.error('Indexing error. ', e);
        });
  }, { concurrency: 1 })
    .then(() => {
      return this.commit(collectionName);
    })
    .then(() => {
      return Promise.resolve();
    })
    .catch((e) => {
      log.error('Unexpected file indexing error.', e);
      return Promise.reject(e);
    });
};

exports.indexListing = function indexListing(content, collectionName) {
  try {
    const solrUpdateUrl = 'http://' + config.get('dbConfig.solr.host') + ':' +
      config.get('dbConfig.solr.port') +
      '/solr/' + collectionName + '/update',
      doc = JSON.parse(content),
      id = doc.n + '-' + doc.verc;
    let whatsnew = '';
    if (doc.new) {
      whatsnew = doc.new.join(' ');
    }
    let jsonDoc = {
      'id': id,
      'n': doc.n,
      'verc': doc.verc,
      't': doc.t,
      'sz': doc.sz,
      'rct': doc.rct,
      'rate': doc.rate,
      'purl': doc.purl,
      'pri': doc.pri,
      'os': doc.os,
      'new': whatsnew,
      'dtxt': doc.dtxt,
      'dtp': doc.dtp,
      'desc': doc.desc,
      'dct': doc.dct,
      'curl': doc.curl,
      'crt': doc.crt,
      'crat': doc.crat,
      'cat': doc.cat,
      'cadd': doc.cadd
    };
    jsonDoc = _.omit(jsonDoc, (val) => {
      return (val === '' || val === undefined);
    });
    return request.postAsync({
      url: solrUpdateUrl,
      json: {
        add: {
          doc: jsonDoc
        }
      } })
      .get(1)
      .then((body) => {
        if (body.responseHeader !== undefined && body.responseHeader.status === 0) {
          log.info('Successfully updated %s', id);
          return Promise.resolve(id);
        }
        else {
          throw new Error('Listing detail indexing failed for ' + id +
            '. Response Header: ' + JSON.stringify(body));
        }
      })
      .catch((e) => {
        log.error('Indexing error.', e);
        return Promise.reject(e);
      });
  }
  catch (e) {
    log.error('Listing collection indexing error. ' + e.message);
    return Promise.reject(e);
  }
};
