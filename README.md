<p align="center">
  <a href="http://sieveable.io">
    <img src="http://sieveable.io/images/sieveable.png">
  </a>
</p>

# [Sieveable](http://sieveable.io)
**The deep search engine for Android apps.** *Powered by Node.js*

[![Build Status](https://travis-ci.org/sikuli/sieveable.svg?branch=master)](http://travis-ci.org/sikuli/sieveable) [![Coverage Status](https://coveralls.io/repos/sikuli/sieveable/badge.svg)](https://coveralls.io/r/sikuli/sieveable) [![Dependency Status](https://david-dm.org/sikuli/sieveable.svg)](https://david-dm.org/sikuli/sieveable) [![devDependency Status](https://david-dm.org/sikuli/sieveable/dev-status.svg)](https://david-dm.org/sikuli/sieveable#info=devDependencies)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/sikuli/sieveable)


# Requirements
- A Unix-like operating system (eg. Linux, FreeBSD, Mac OS X, etc.).
- node.js version 5.x.
- Install node.js project dependencies:
  - `npm install`
  - Install [gulp]('http://gulpjs.com/') globally: `npm install gulp -g`
- This system requires running two NoSQL database servers:
  - [Redis]('http://redis.io/') version 3.x.
  - [Solr]('http://lucene.apache.org/solr/') version 5.x.

# Quick Start Developer Install

- Set the *NODE_ENV* configuration environment variable:
  -  `export NODE_ENV=development` This variable contains the name of the application's deployment environment and can take the value of the base name of the configuration files at the ./config directory, e.g., _development_.
  - To check the value of the exported *NODE_ENV* variable before running the app, execute `echo $NODE_ENV` in your shell.
  - If you want to use a different dataset, then you can change the path to the dataset directory in the configuration file at *./config* depending on the config file you want to use. All dataset paths must be relative to the configuration file.
- Start redis-server and solr (in cloud mode). You can do that in your shell or you can run ``` $ gulp start:db ``` task in another shell window, which requires redis-server and solr binaries to be defined in your PATH in addition to editing the configuration file at ```config/redis.conf```.
- Once all database servers are running, run the default gulp build task:

  ```shell
  $ gulp
  ```
- Make sure all tests pass before starting sieveable's web server.

  ```shell
  $ npm test
  ```
- Start sieveable's web server:

  ```shell
  $ node bin/www
  ```
  - The server should be running at: http://localhost:3000
  - We can send HTTTP GET requests to query Sieveable. For example, to find apps that have the word "Google" in their title and has a RelativeLayout with a Button child, we can send the following HTTP GET request using *curl*:

  ```shell
  curl -G "http://localhost:3000/q/json" --data-urlencode \
   "queryText=MATCH app WHERE <title>Google</title><RelativeLayout><Button></Button></RelativeLayout> RETURN app"
  ```

# Documentation
For a getting started guide, sieveable search query syntax, examples, etc. see the [Wiki](https://github.com/sikuli/sieveable/wiki).

# Additional Tools
- [sieveable-tools](https://github.com/sieveable/sieveable-browser): tools for importing data into Sieveable
- [sieveable-browser](https://github.com/sieveable/sieveable-tools): a web-based user interface for Sieveable

# Known Issues
- If the code indexing task (```gulp index:code```) fails with an out of memory error, try to increase solr's heap size. You can do that by restarting Solr with: ```solr -restart -m 1g -cloud -V ```

# Caution
- *Contains JavaScript.* :astonished:
- *Made in a facility that also processes Java and Python.*  :smiley:

# License
- Sieveable is licensed under the [MIT license](./LICENSE.txt).
- Documentation is licensed under a [Creative Commons Attribution 4.0 International license](./LICENSE-docs).

***

<p align="center"> &copy; <a href="http://lab.sikuli.org">Sikuli Lab</a> 2015</p>
