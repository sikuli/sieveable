const Promise = require('bluebird'),
  request = Promise.promisifyAll(require('request')),
  exec = require('child_process').exec,
  _ = require('lodash'),
  log = require('../logger'),
  config = require('config');

function SolrCollectionError(message) {
  this.message = message;
  this.name = 'SolrCollectionError';
}
SolrCollectionError.prototype = Object.create(Error.prototype);
SolrCollectionError.prototype.constructor = SolrCollectionError;

exports.exists = function collectionExists(collectionName) {
  const solrUrl =
    `http://${config.get('dbConfig.solr.host')}:${config.get('dbConfig.solr.port')}/solr/admin/collections`;
  return request.getAsync({ url: solrUrl, qs: { action: 'LIST', wt: 'json' } })
    .spread((response, body) => {
      if (response.statusCode !== 200) {
        throw new Error(`Failed to find collection: ${collectionName}. Reason: ${body.error.msg}`);
      }
      const resObj = JSON.parse(body);
      if (resObj.responseHeader.status !== 0) {
        throw new SolrCollectionError(
            `Solr LIST action has failed. Reason ${body.error.msg}`);
      }
      if (_.indexOf(resObj.collections, collectionName) === -1) {
        throw new SolrCollectionError(`Solr collection ${collectionName} does not exist.`);
      }
      log.info(`Collection ${collectionName} exists.`);
      return Promise.resolve();
    })
    .catch((e) => {
      return Promise.reject(e);
    });
};

exports.createCollection = function createCollection(collectionName) {
  const cmd = `solr create -c ${collectionName} -p ${config.get('dbConfig.solr.port')}`;
  log.info('Running', cmd);
  return new Promise((resolve, reject) => {
    exec(cmd, { shell: config.get('system.shell') }, (err, stdout, stderr) => {
      // Solr create script returns 0 when a collection already exists
      // TODO: change this condition to err instead of !err once this issue is resolved.
      // https://issues.apache.org/jira/browse/SOLR-8801
      if (!err && stderr.indexOf('already exists') > -1) {
        log.info(`Collection ${collectionName} alread exists.`);
        return resolve('already exists');
      }
      if (err) {
        log.error(`failed to create collection ${collectionName}.` +
          `stdout= ${stdout}, stderr= ${stderr}`, err);
        return reject(new SolrCollectionError(stdout));
      }
      log.info(`Solr collection ${collectionName} has been created. ` +
        `stdout= ${stdout}, stderr= ${stderr}`);
      return resolve('created');
    });
  });
};

exports.addField = function addField(collection, field) {
  const solrUrl =
  `http://${config.get('dbConfig.solr.host')}:${config.get('dbConfig.solr.port')}/solr/${collection}/schema`;
  return request.postAsync({ url: solrUrl, json: { 'add-field': field } })
    .spread((response, body) => {
      if (response.statusCode === 200 && body.responseHeader.status === 0) {
        if (body.errors === undefined) {
          log.info(`Field: ${field.name} has been created in collection: ${collection}`);
          return Promise.resolve('field created');
        }
        else if (body.errors.length > 0 &&
          body.errors[0].errorMessages.toString().indexOf('already exists') > -1) {
          log.info(body.errors[0].errorMessages.toString());
          return Promise.resolve('already exists');
        }
      }
      throw new SolrCollectionError(
        `Failed to create a new field: ${field.name} in collection:
        ${collection}. Reason: ${body.errors[0].errorMessages.toString()}`);
    })
    .catch((e) => {
      return Promise.reject(new SolrCollectionError(e.message));
    });
};
