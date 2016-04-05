const path = require('path'),
  Promise = require('bluebird'),
  postAsync = Promise.promisify(require('request').post, { multiArgs: true }),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  config = require('config'),
  log = require('../logger'),
  timeout = 60000;

exports.commit = function commit(collectionName) {
  const solrUpdateUrl =
    `http://${config.get('dbConfig.solr.host')}:` +
    `${config.get('dbConfig.solr.port')}/solr/${collectionName}/update`;
  // commit all pending updates
  return postAsync({ headers: { 'content-type': 'application/json' },
      url: solrUpdateUrl,
      timeout,
      qs: {
        commit: 'true',
        wt: 'json'
      }
    })
    .get(1)
    .then((body) => {
      const resHeader = JSON.parse(body).responseHeader;
      if (resHeader && resHeader.status === 0) {
        log.info('Successfully committed index changes to collection ', collectionName);
        return Promise.resolve('done');
      }
      throw new Error(`Failed to commit index changes to collection ${collectionName} ` +
        `. Reason: ${JSON.stringify(resHeader)}`);
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
  const solrExtractUrl =
    `http://${config.get('dbConfig.solr.host')}:` +
    `${config.get('dbConfig.solr.port')}/solr/${collectionName}/update/extract`;
  log.info('Indexing %d files in the %s collection.', fileNames.length,
    collectionName);
  return Promise.map(fileNames, (fileName) => {
    const appInfo = path.basename(fileName, extention).split('-'),
      packageName = appInfo[0],
      versionCode = appInfo[1],
      appId = `${packageName}-${versionCode}`,
      solrUpdateParams = {
        'literal.id': appId,
        'literal.package_name': packageName,
        'literal.version_code': Number(versionCode),
        wt: 'json',
        my_file: {
          value: fs.createReadStream(fileName),
          options: {
            contentType: 'text/plain'
          }
        }
      };

    return postAsync({ url: solrExtractUrl, formData: solrUpdateParams, timeout })
        .get(1)
        .then((body) => {
          const resHeader = JSON.parse(body).responseHeader;
          if (resHeader && resHeader.status === 0) {
            log.info('Successfully updated %s-%s', packageName, versionCode);
          }
          else {
            throw new FileIndexingError(
              `File indexing failed for ${fileName}. Response: ${JSON.stringify(body)}`, fileName);
          }
        })
        .catch(FileIndexingError, (e) => {
          log.error('Indexing error.', e);
        });
  }, { concurrency: 3 })
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
    const solrUpdateUrl =
      `http://${config.get('dbConfig.solr.host')}:` +
      `${config.get('dbConfig.solr.port')}/solr/${collectionName}/update`,
      doc = JSON.parse(content),
      id = `${doc.n}-${doc.verc}`,
      whatsnew = getWhatsNew(doc.new),
      jsonDoc = {
        id,
        n: doc.n,
        verc: doc.verc,
        t: doc.t,
        sz: doc.sz,
        rct: doc.rct,
        rate: doc.rate,
        purl: doc.purl,
        pri: doc.pri,
        os: doc.os,
        new: whatsnew,
        dtxt: doc.dtxt,
        dtp: doc.dtp,
        desc: doc.desc,
        dct: doc.dct,
        curl: doc.curl,
        crt: doc.crt,
        crat: doc.crat,
        cat: doc.cat,
        cadd: doc.cadd
      },
      jsonDocCompacted = _.omit(jsonDoc, (val) => {
        return (val === '' || val === undefined);
      });
    return postAsync({
      url: solrUpdateUrl,
      timeout,
      json: {
        add: {
          doc: jsonDocCompacted
        }
      } })
      .get(1)
      .then((body) => {
        if (body.responseHeader !== undefined && body.responseHeader.status === 0) {
          log.info('Successfully updated %s', id);
          return Promise.resolve(id);
        }
        throw new Error('Listing detail indexing failed for %s. Response Header: %s',
            id, JSON.stringify(body));
      })
      .catch((e) => {
        log.error('Indexing error.', e);
        return Promise.reject(e);
      });
  }
  catch (e) {
    log.error('Listing collection indexing error.', e);
    return Promise.reject(e);
  }
};

function getWhatsNew(text) {
  if (text === undefined) {
    return undefined;
  }
  if (_.isArray(text)) {
    return text.join(' ');
  }
  return text;
}
