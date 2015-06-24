# Sieveable [![Build Status](https://travis-ci.org/sikuli/sieveable.svg?branch=master)](http://travis-ci.org/sikuli/sieveable) [![Coverage Status](https://coveralls.io/repos/sikuli/sieveable/badge.svg)](https://coveralls.io/r/sikuli/sieveable) [![Dependency Status](https://david-dm.org/sikuli/sieveable.svg)](https://david-dm.org/sikuli/sieveable.svg)

Searching and Filtering Mobile Apps.

# Requirements
- A Unix-like operating system (eg. Linux, FreeBSD, Mac OS X, etc.).
- node.js version 0.12 or higher.
- Install node.js project dependencies:
  - `npm install`
  - Install [gulp]('http://gulpjs.com/'): `npm install gulp -g`
- This system requires running three database servers: [MongoDB]('https://www.mongodb.org/'), [Redis]('http://redis.io/'), and [Solr]('http://lucene.apache.org/solr/').
  
# Usage

- Set the *NODE_ENV* configuration environment variable:
  -  `export NODE_ENV=development` This variable contains the name of the application's deployment environment and can take the value of the base name of the configuration files at the ./config directory, i.e., any of the following values: ```development```, ```staging```, ```production```.
  - To check the value of the exported *NODE_ENV* variable before running the app, execute `echo $NODE_ENV` in your shell to see the current value.
  - If you want to use a different dataset, then you can change the path to the dataset directory in the configuration file at *./config* depending on the config file you want to use. The dataset path must be a relative path to the configuration file.
- Start mongod, redis, and solr in cloud mode. You can do that in your shell or you can run ``` $ gulp start:db ``` task in another shell window, which requires mongod, redis-server, and solr binaries to be defined in your PATH. 
- Once all database servers are running, run the following gulp task: 

  ```shell
  $ gulp
  ```
- Make sure all tests pass before starting sieveable's web server.

  ```shell
  $ npm test
  ```
- Start sieveable's web server:

  ```shell
  node bin/www
  ```
  - The server should be running at: http://localhost:3000/ui


# Known Issues
- If the code indexing task (```gulp index:code```) fails with an out of memory error, try to increase solr's heap size by restarting the Solr server with: ```solr -restart -m 1g -cloud -V ```

