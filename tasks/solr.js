'use strict';
const gulp = require('gulp'),
  Promise = require('bluebird'),
  config = require('config'),
  path = require('path'),
  fs = Promise.promisifyAll(require('fs')),
  _ = require('lodash'),
  solrIndex = require('../lib/index/solr-index'),
  solrAdmin = require('../lib/index/solr-admin'),
  log = require('../lib/logger'),
  CONFIG_PATH = path.resolve(__dirname, '..', 'config');

gulp.task('solr:create', () => {
  const collections = [
    config.get('dbConfig.solr.listingCollection'),
    config.get('dbConfig.solr.uiTagCollection'),
    config.get('dbConfig.solr.uiSuffixCollection'),
    config.get('dbConfig.solr.manifestCollection'),
    config.get('dbConfig.solr.codeCollection')];
  return Promise.all([solrAdmin.createCollection(collections[0]),
        solrAdmin.createCollection(collections[1]),
        solrAdmin.createCollection(collections[2]),
        solrAdmin.createCollection(collections[3]),
        solrAdmin.createCollection(collections[4])])
    .catch((e) => {
      log.error('ERROR: ' + e.message);
      return Promise.reject(e);
    });
});

gulp.task('solr:addKeyFields', () => {
  const collections = [config.get('dbConfig.solr.uiTagCollection'),
                         config.get('dbConfig.solr.uiSuffixCollection'),
                         config.get('dbConfig.solr.manifestCollection'),
                         config.get('dbConfig.solr.codeCollection')],
    packageField = {
      'name': 'package_name',
      'type': 'string',
      'indexed': true,
      'required': true,
      'stored': true
    },
    versionCodeField = {
      'name': 'version_code',
      'type': 'int',
      'indexed': true,
      'required': true,
      'stored': true
    };

  return Promise.all([
    solrAdmin.addField(collections[0], packageField),
    solrAdmin.addField(collections[0], versionCodeField),
    solrAdmin.addField(collections[1], packageField),
    solrAdmin.addField(collections[1], versionCodeField),
    solrAdmin.addField(collections[2], packageField),
    solrAdmin.addField(collections[2], versionCodeField),
    solrAdmin.addField(collections[3], packageField),
    solrAdmin.addField(collections[3], versionCodeField),
  ])
    .catch((e) => {
      log.error('ERROR: ' + e.message);
      return Promise.reject(e);
    });
});

// add all listing detail fields to the schema
gulp.task('solr:addListingFields', () => {
  const collection = config.get('dbConfig.solr.listingCollection'),
    packageField = {
      'name': 'n',
      'type': 'string',
      'indexed': true,
      'required': true,
      'stored': true
    },
    versionCodeField = {
      'name': 'verc',
      'type': 'int',
      'indexed': true,
      'required': true,
      'stored': true
    },
    creatorAddressField = {
      'name': 'cadd',
      'type': 'text_general',
      'indexed': true,
      'required': false,
      'stored': true
    },
    categoryField = {
      'name': 'cat',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    contentRatingField = {
      'name': 'crat',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    creatorField = {
      'name': 'crt',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    creatorUrlField = {
      'name': 'curl',
      'type': 'string',
      'indexed': false,
      'required': false,
      'stored': true
    },
    minDownloadCountField = {
      'name': 'dct',
      'type': 'long',
      'indexed': true,
      'required': false,
      'stored': true
    },
    descriptionField = {
      'name': 'desc',
      'type': 'text_general',
      'indexed': true,
      'required': false,
      'stored': true
    },
    datePublishedField = {
      'name': 'dtp',
      'type': 'text_general',
      'indexed': true,
      'required': false,
      'stored': true
    },
    downloadCountTextField = {
      'name': 'dtxt',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    whatsNewField = {
      'name': 'new',
      'type': 'text_general',
      'indexed': true,
      'required': false,
      'stored': true
    },
    osField = {
      'name': 'os',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    priceField = {
      'name': 'pri',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    privacyUrlField = {
      'name': 'purl',
      'type': 'string',
      'indexed': false,
      'required': false,
      'stored': true
    },
    starRatingField = {
      'name': 'rate',
      'type': 'float',
      'indexed': true,
      'required': false,
      'stored': true
    },
    ratingCountField = {
      'name': 'rct',
      'type': 'int',
      'indexed': true,
      'required': false,
      'stored': true
    },
    downloadSizeField = {
      'name': 'sz',
      'type': 'string',
      'indexed': true,
      'required': false,
      'stored': true
    },
    titleField = {
      'name': 't',
      'type': 'text_general',
      'indexed': true,
      'required': false,
      'stored': true
    };
  return Promise.all([
    solrAdmin.addField(collection, packageField),
    solrAdmin.addField(collection, versionCodeField),
    solrAdmin.addField(collection, creatorField),
    solrAdmin.addField(collection, creatorAddressField),
    solrAdmin.addField(collection, categoryField),
    solrAdmin.addField(collection, contentRatingField),
    solrAdmin.addField(collection, creatorUrlField),
    solrAdmin.addField(collection, minDownloadCountField),
    solrAdmin.addField(collection, descriptionField),
    solrAdmin.addField(collection, datePublishedField),
    solrAdmin.addField(collection, downloadCountTextField),
    solrAdmin.addField(collection, downloadSizeField),
    solrAdmin.addField(collection, osField),
    solrAdmin.addField(collection, priceField),
    solrAdmin.addField(collection, privacyUrlField),
    solrAdmin.addField(collection, starRatingField),
    solrAdmin.addField(collection, ratingCountField),
    solrAdmin.addField(collection, whatsNewField),
    solrAdmin.addField(collection, titleField)
  ])
    .catch((e) => {
      log.error('ERROR: ' + e.message);
      return Promise.reject(e);
    });
});

gulp.task('solr:indexUITag', () => {
  const collectionName = config.get('dbConfig.solr.uiTagCollection'),
    datasetDirs = _.pluck(config.get('dataset.ui'),
      'indexes.extractUITagDir'),
    datasetPaths = _.map(datasetDirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(datasetPaths, (datasetPath) => {
    return fs.readdirAsync(datasetPath)
        .then((files) => {
          return _.filter(files, (f) => {
            return path.extname(f) === '.txt';
          });
        })
        .then((files) => {
          const fileNamePaths = _.map(files, (f) => {
            return path.resolve(datasetPath, f);
          });
          return solrIndex.indexFile(fileNamePaths, '-ui-tag.txt',
            collectionName);
        })
        .catch((e) => {
          log.error(e);
        });
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch((e) => {
      log.error(e);
      return Promise.reject(e);
    });
});

gulp.task('solr:indexUISuffix', () => {
  const collectionName = config.get('dbConfig.solr.uiSuffixCollection'),
    datasetDirs = _.pluck(config.get('dataset.ui'),
      'indexes.extractUISuffixDir'),
    datasetPaths = _.map(datasetDirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(datasetPaths, (datasetPath) => {
    return fs.readdirAsync(datasetPath)
        .then((files) => {
          return _.filter(files, (f) => {
            return path.extname(f) === '.txt';
          });
        })
        .then((files) => {
          const fileNamePaths = _.map(files, (f) => {
            return path.resolve(datasetPath, f);
          });
          return solrIndex.indexFile(fileNamePaths, '-ui-suffix.txt',
            collectionName);
        })
        .catch((e) => {
          log.error(e);
        });
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch((e) => {
      log.error(e);
      return Promise.reject(e);
    });
});

gulp.task('solr:indexManifest', () => {
  const collectionName = config.get('dbConfig.solr.manifestCollection'),
    datasetDirs = _.pluck(config.get('dataset.manifest'),
      'indexes.extractManifestDir'),
    datasetPaths = _.map(datasetDirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(datasetPaths, (datasetPath) => {
    return fs.readdirAsync(datasetPath)
        .then((files) => {
          return _.filter(files, (f) => {
            return path.extname(f) === '.txt';
          });
        })
        .then((files) => {
          const fileNamePaths = _.map(files, (f) => {
            return path.resolve(datasetPath, f);
          });
          return solrIndex.indexFile(fileNamePaths,
            '-manifest-tag.txt', collectionName);
        })
        .catch((e) => {
          log.error(e);
        });
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch((e) => {
      log.error(e);
      return Promise.reject(e);
    });
});

gulp.task('solr:indexCode', () => {
  const collectionName = config.get('dbConfig.solr.codeCollection'),
    datasetDirs = _.pluck(config.get('dataset.code'), 'target'),
    datasetPaths = _.map(datasetDirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(datasetPaths, (datasetPath) => {
    return fs.readdirAsync(datasetPath)
        .then((files) => {
          return _.filter(files, (f) => {
            return path.extname(f) === '.txt';
          });
        })
        .then((files) => {
          const fileNamePaths = _.map(files, (f) => {
            return path.resolve(datasetPath, f);
          });
          return solrIndex.indexFile(fileNamePaths, '.smali.txt',
            collectionName);
        })
        .catch((e) => {
          log.error(e);
        });
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch((e) => {
      log.error(e);
      return Promise.reject(e);
    });
});

gulp.task('solr:indexListing', () => {
  const datasetDirs = _.pluck(config.get('dataset.listing'), 'target'),
    listingCollection = config.get('dbConfig.solr.listingCollection'),
    datasetPaths = _.map(datasetDirs, (dir) => {
      return path.resolve(CONFIG_PATH, dir);
    });
  return Promise.map(datasetPaths, (datasetPath) => {
    return fs.readdirAsync(datasetPath)
      .then((files) => {
        return _.filter(files, (f) => {
          return path.extname(f) === '.json';
        });
      })
      .then((files) => {
        return _.map(files, (f) => {
          return path.resolve(datasetPath, f);
        });
      })
      .map((fileName) => {
        return fs.readFileAsync(fileName, 'utf8')
          .then((content) => {
            return solrIndex.indexListing(content,
              listingCollection);
          });
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  });
});

gulp.task('solr:commitAll', () => {
  const solrConfig = config.get('dbConfig.solr');
  return Promise.all([
    solrIndex.commit(solrConfig.listingCollection),
    solrIndex.commit(solrConfig.uiTagCollection),
    solrIndex.commit(solrConfig.uiSuffixCollection),
    solrIndex.commit(solrConfig.manifestCollection),
    solrIndex.commit(solrConfig.codeCollection)
  ])
    .then(() => {
      log.info('Successfully committed changes to all indexes.');
    })
    .catch((e) => {
      log.error('Failed to commit all index changes. ', e);
      return Promise.reject(e);
    });
});
