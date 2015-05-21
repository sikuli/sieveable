# Sieveable [![Build Status](https://travis-ci.org/sikuli/diff-apps.svg?branch=master)](http://travis-ci.org/sikuli/diff-apps)

Mobile Apps Search and Filtering System.


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
- Start the server:
  - `node bin/www`

# Test

	$ mocha

# Known Issues
- If you run the indexing task (```gulp index:code```) and get out of memory errors, try to increase solr's heap size by restarting the Solr server with: ```solr -restart -m 4g -cloud -V ```