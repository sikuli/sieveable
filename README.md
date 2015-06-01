# Sieveable [![Build Status](https://travis-ci.org/sikuli/sieveable.svg?branch=master)](http://travis-ci.org/sikuli/sieveable) [![Coverage Status](https://coveralls.io/repos/sikuli/sieveable/badge.svg)](https://coveralls.io/r/sikuli/sieveable)

Searching and Filtering Mobile Apps.


# Requirements

- node.js version 0.12 or higher.
- Install node.js project dependencies:
  - `npm install`
  - Install [gulp]('http://gulpjs.com/'): `npm install gulp -g`
- This system requires running three servers: [MongoDB]('https://www.mongodb.org/'), [Redis]('http://redis.io/'), and [Solr]('http://lucene.apache.org/solr/').
- The location of the following executables must be defined in your PATH.
  - mongod
  - redis-server
  - solr
  
# Usage

- Set the *NODE_ENV* configuration environment variable:
  -  `export NODE_ENV=development` This variable contains the name of the application's deployment environment and can take the value of the base name of the configuration files at the ./config directory, i.e., any of the following values: ```development```, ```staging```, ```production```.
  - To check the value of the exported *NODE_ENV* variable before running the app, execute `echo $NODE_ENV` in your shell to see the current value.
  - If you want to use a different dataset, then you can change the path to the dataset directory in the configuration file at *./config* depending on the config file you want to use. The dataset path must be a relative path to the configuration file.
- Start mongod, redis, and solr in cloud mode. You can do that in your shell or you can run the _start:db_ gulp task in another shell window or tab: ``` $ gulp start:db ```
- Run the following gulp tasks one by one, in the exact order shown below: 

  ```shell
   $ gulp
   $ gulp load:db
   $ gulp index:ui
   $ gulp solr:indexCode
   $ gulp solr:commit
   ```
 
- Start the server:

  ```shell
  node bin/www
  ```
  - The server should be running at: http://localhost:3000/ui

# Test

	$ mocha

# Known Issues
- If you run the indexing task (```gulp index:code```) and get out of memory errors, try to increase solr's heap size by restarting the Solr server with: ```solr -restart -m 4g -cloud -V ```

