'use strict';
const gulp = require('gulp'),
  Promise = require('bluebird'),
  exec = require('child_process').exec,
  execAsync = Promise.promisify(exec),
  config = require('config'),
  log = require('../lib/logger');

function startSolr() {
  const solrStatus = 'solr status',
    // start Solr in SolrCloud mode as a daemon
    solrHost = config.get('dbConfig.solr.host'),
    solrPort = config.get('dbConfig.solr.port'),
    solrStart = `solr start -cloud -V -h ${solrHost} -p ${solrPort}`;
  log.info('Starting Solr server in SolrCloud mode. ');
  return new Promise((resolve, reject) => {
    execAsync(solrStatus, { shell: config.get('system.shell') })
      .then((stdout) => {
        if (stdout && stdout.indexOf(`on port ${solrPort}`)) {
          log.info(`Solr is already running on ${solrPort}`);
          return true;
        }
        return false;
      })
      .then((solrIsRunning) => {
        if (solrIsRunning) {
          resolve();
        }
        return execAsync(solrStart, { shell: config.get('system.shell') })
            .then((stdout, stderr) => {
              if (stderr) {
                reject(new Error(`Failed to start Solr\n ${stderr}`));
              }
              else {
                resolve();
              }
            });
      });
  });
}


gulp.task('start:db', (callback) => {
  // start db servers
  startSolr()
    .then(() => {
      callback();
    })
    .catch((e) => {
      log.error(e.message);
      callback(e);
    });
});
