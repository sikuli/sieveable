<p align="center">
  <a href="http://sieveable.io">
    <img src="http://sieveable.io/images/sieveable.png">
  </a>
</p>

# Sieveable
**The deep search engine for Android apps.** *Powered by Node.js*

[![Build Status](https://travis-ci.org/sikuli/sieveable.svg?branch=master)](http://travis-ci.org/sikuli/sieveable) [![Coverage Status](https://coveralls.io/repos/sikuli/sieveable/badge.svg)](https://coveralls.io/r/sikuli/sieveable) [![Dependency Status](https://david-dm.org/sikuli/sieveable.svg)](https://david-dm.org/sikuli/sieveable) [![devDependency Status](https://david-dm.org/sikuli/sieveable/dev-status.svg)](https://david-dm.org/sikuli/sieveable#info=devDependencies) [![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.txt)

**Try it now at [sieveable.io](http://sieveable.io)**


# Installation
## Option 1: Using Docker
- Download the _Dockerfile_ and run the following two docker commands:

```bash
curl -O https://raw.githubusercontent.com/sikuli/sieveable/master/Dockerfile
docker build -t username/sieveable:latest .
docker run -p 3000:3000 -d username/sieveable:latest
```

## Option 2: Building from source
### Requirements
- A Unix-like operating system (eg. Debian, CentOS, Mac OS X, etc.).
- node.js version 5.x.
- Install node.js project dependencies:
  - `npm install`
  - Install [gulp]('http://gulpjs.com/') globally: `npm install gulp -g`
- This system requires running two NoSQL database servers:
  - [Redis]('http://redis.io/') version 3.x.
  - [Solr]('http://lucene.apache.org/solr/') version 5.x.

 ### Installation
- Clone the repo.
- Set the *NODE_ENV* configuration environment variable:
  -  `export NODE_ENV=development` This variable contains the name of the application's deployment environment and can take the value of the base name of the configuration files at the ./config directory, e.g., _development_.
  - To check the value of the exported *NODE_ENV* variable before running the app, execute `echo $NODE_ENV` in your shell.
  - If you want to use a different dataset, then you can change the path to the dataset directory in the configuration file at *./config* depending on the config file you want to use. All dataset paths must be relative to the configuration file.
- Start redis-server and solr (in cloud mode). You can do that in your shell or you can run ``` gulp start:db ``` task in another shell window, which requires redis-server and solr binaries to be defined in your PATH in addition to editing the configuration file at ```config/redis.conf```.
- Create the Solr collections defined in your config file at `config/`.
- Once all database servers are running, run the default gulp build task:

  ```shell
  gulp
  ```
- Make sure all tests pass before starting sieveable's web server.

  ```shell
  npm test
  ```
- Start sieveable's web server:

  ```shell
  npm run
  ```

# Usage
- The server should be running at: http://localhost:3000
  - We can now send an HTTTP GET request to query Sieveable. For example, to find apps that have the word "Google" in their title and has a RelativeLayout with a Button child, we can send the following HTTP GET request using *curl*:

  ```shell
  curl -G "http://localhost:3000/q" --data-urlencode \
   "queryText=\
   MATCH app\
   WHERE\
   <title>Google</title>\
   <RelativeLayout>\
      <Button></Button>\
   </RelativeLayout>\
   RETURN app"
  ```

# Documentation
For a getting started guide, sieveable search query syntax, and examples, see the [Wiki](https://github.com/sikuli/sieveable/wiki).

# Additional Tools
- [sieveable-browser](https://github.com/sieveable/sieveable-browser): a web-based user interface for Sieveable.
- [sieveable-tools](https://github.com/sieveable/sieveable-tools): tools for extracting features from apps and importing data into Sieveable.

# Known Issues
- If the code indexing task (```gulp index:code```) fails with an out of memory error, try to increase solr's heap size. You can do that by restarting Solr with: ```solr -restart -c -m 1g```

# Caution
- *Contains JavaScript.* :astonished:
- *Made in a facility that also processes Java and Python.*  :smiley:

# License
- Sieveable is licensed under the [MIT license](./LICENSE.txt).
- Documentation is licensed under a [Creative Commons Attribution 4.0 International license](./LICENSE-docs).
