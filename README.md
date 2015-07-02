<p align="center">
  <a href="http://sieveable.io">
    <img height="150" width="450" src="https://github.com/sikuli/sieveable/wiki/images/sieveable.png">
  </a>
</p>

# Sieveable
**Searching and Filtering Android Apps.**

[![Build Status](https://travis-ci.org/sikuli/sieveable.svg?branch=master)](http://travis-ci.org/sikuli/sieveable) [![Coverage Status](https://coveralls.io/repos/sikuli/sieveable/badge.svg)](https://coveralls.io/r/sikuli/sieveable) [![Dependency Status](https://david-dm.org/sikuli/sieveable.svg)](https://david-dm.org/sikuli/sieveable) [![devDependency Status](https://david-dm.org/sikuli/sieveable/dev-status.svg)](https://david-dm.org/sikuli/sieveable#info=devDependencies)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/sikuli/sieveable)


# Requirements
- A Unix-like operating system (eg. Linux, FreeBSD, Mac OS X, etc.).
- node.js version 0.12 or higher.
- Install node.js project dependencies:
  - `npm install`
  - Install [gulp]('http://gulpjs.com/'): `npm install gulp -g`
- This system requires running three database servers: 
  - [MongoDB]('https://www.mongodb.org/') version: 2.6 or higher. 
  - [Redis]('http://redis.io/') version 3.0 or higher. 
  - [Solr]('http://lucene.apache.org/solr/') version 5.1 or higher.
  
# Usage

- Set the *NODE_ENV* configuration environment variable:
  -  `export NODE_ENV=development` This variable contains the name of the application's deployment environment and can take the value of the base name of the configuration files at the ./config directory, e.g., _development_.
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

# Documentation
For a getting started guide, sieveable search query syntax, examples, etc. see the [Wiki](https://github.com/sikuli/sieveable/wiki).

# Known Issues
- If the code indexing task (```gulp index:code```) fails with an out of memory error, try to increase solr's heap size by restarting the Solr server with: ```solr -restart -m 1g -cloud -V ```

