const gulp = require('gulp'),
  Promise = require('bluebird'),
  path = require('path'),
  exec = require('child_process')
  .exec,
  execAsync = Promise.promisify(exec),
  config = require('config'),
  log = require('../lib/logger'),
  CONFIG_PATH = path.resolve(__dirname, '..', 'config');

function startSolr() {
  // start Solr in SolrCloud mode as a daemon
  const solrHost = config.get('dbConfig.solr.host'),
    solrPort = config.get('dbConfig.solr.port'),
    solrStart = `solr start -cloud -V -h ${solrHost} -p ${solrPort}`;
  log.info('Starting Solr server in SolrCloud mode. ');
  return execAsync(solrStart, { shell: config.get('system.shell') })
    .then((stdout) => {
      log.info(stdout);
    })
    .catch((e) => {
      log.error('Failed to start Solr', e);
      return Promise.reject(e);
    });
}

function startRedis() {
  // start Redis server
  const redisStart = 'redis-server ' +
    `${path.resolve(CONFIG_PATH, config.get('dbConfig.redis.config'))}`;
  log.info('Starting Redis server as a daemon process. ');
  return execAsync(redisStart, { shell: config.get('system.shell') })
    .then((stdout) => {
      log.info(stdout);
    })
    .catch((e) => {
      log.error('Failed to start Redis', e);
      return Promise.reject(e);
    });
}

gulp.task('start:db', (callback) => {
  // start db servers
  startSolr()
    .then(() => {
      return startRedis();
    })
    .then(() => {
      log.info('Solr and Redis have been successfully started.');
      callback();
    })
    .catch((e) => {
      log.error(e.message);
      callback(e);
    });
});
