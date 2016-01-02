'use strict';
const gulp = require('gulp'),
    path = require('path'),
    _ = require('lodash'),
    exec = require('child_process').exec,
    Promise = require('bluebird'),
    execAsync = Promise.promisify(exec),
    fs = Promise.promisifyAll(require('fs')),
    config = require('config'),
    mkdirp = require('mkdirp'),
    log = require('../lib/logger'),
    tagNameExtractor = require('../lib/index/tag-name-extractor'),
    suffixExtractor = require('../lib/index/suffix-extractor'),
    CONFIG_PATH = path.resolve(__dirname, '..', 'config');

function getUntarCommand(obj) {
    // If the target directory does not exist, create it
    mkdirp.sync(path.resolve(CONFIG_PATH, obj.target), { mode: '2775' });
    // return the extract tar command
    return 'tar xvjf ' + path.resolve(CONFIG_PATH, obj.source) +
           ' -C ' + path.resolve(CONFIG_PATH, obj.target);
}

gulp.task('extract:archives', () => {
    const listing = _.map(config.get('dataset.listing'), getUntarCommand),
        code = _.map(config.get('dataset.code'), getUntarCommand),
        manifest = _.map(config.get('dataset.manifest'), getUntarCommand),
        ui = _.map(config.get('dataset.ui'), getUntarCommand),
        commands = listing.concat(code).concat(manifest).concat(ui);
    return Promise.map(commands, (cmd) => {
        log.info(cmd);
        return execAsync(cmd);
    }).then(() => {
        log.info('All archives have been extracted.');
    }).error((error) => {
        log.error(error);
        return Promise.reject(error);
    });
});

gulp.task('extract:ui-tag', () => {
    const uiConfigs = _.map(config.dataset.ui, (ui) => {
        return { source: ui.target, target: ui.indexes.extractUITagDir };
    });
    return Promise.map(uiConfigs, (uiConfig) => {
        mkdirp.sync(path.resolve(CONFIG_PATH, uiConfig.target), { mode: '2775' });
        return fs.readdirAsync(path.resolve(CONFIG_PATH, uiConfig.source))
            .then((files) => {
                return _.filter(files, (f) => {
                    return path.extname(f) === '.xml';
                });
            })
            .then((xmlFileNames) => {
                const xmlFileNamePaths = _.map(xmlFileNames, (file) => {
                    return path.resolve(CONFIG_PATH, uiConfig.source, file);
                });
                return tagNameExtractor(xmlFileNamePaths,
                  path.resolve(CONFIG_PATH, uiConfig.target), '-ui-tag');
            })
            .then(() => {
                log.info('Extracted ui tag names for all XML files at ' +
                          path.resolve(CONFIG_PATH, uiConfig.source));
            })
            .catch((e) => {
                log.error(e);
            });
    }).then(() => {
        return Promise.resolve();
    }).catch((e) => {
        log.error(e);
        return Promise.reject(e);
    });
});

gulp.task('extract:ui-suffix', () => {
    const uiConfigs = _.map(config.dataset.ui, (ui) => {
        return { source: ui.target, target: ui.indexes.extractUISuffixDir };
    });
    return Promise.map(uiConfigs, (uiConfig) => {
        mkdirp.sync(path.resolve(CONFIG_PATH, uiConfig.target), { mode: '2775' });
        return fs.readdirAsync(path.resolve(CONFIG_PATH, uiConfig.source))
            .then((files) => {
                return _.filter(files, (f) => {
                    return path.extname(f) === '.xml';
                });
            })
            .then((xmlFileNames) => {
                const xmlFileNamePaths = _.map(xmlFileNames, (file) => {
                    return path.resolve(CONFIG_PATH, uiConfig.source, file);
                });
                return suffixExtractor(xmlFileNamePaths,
                  path.resolve(CONFIG_PATH, uiConfig.target));
            })
            .then(() => {
                log.info('Extracted ui suffix for all XML files at ' +
                          path.resolve(CONFIG_PATH, uiConfig.source));
            })
            .catch((e) => {
                log.error(e);
            });
    }).then(() => {
        return Promise.resolve();
    }).catch((e) => {
        log.error(e);
        return Promise.reject(e);
    });
});

gulp.task('extract:manifest', () => {
    const manifestConfigs = _.map(config.dataset.manifest, (manifest) => {
        return { source: manifest.target, target: manifest.indexes.extractManifestDir };
    });
    return Promise.map(manifestConfigs, (manifestConfig) => {
        mkdirp.sync(path.resolve(CONFIG_PATH, manifestConfig.target), { mode: '2775' });
        return fs.readdirAsync(path.resolve(CONFIG_PATH, manifestConfig.source))
            .then((files) => {
                return _.filter(files, (f) => {
                    return path.extname(f) === '.xml';
                });
            })
            .then((xmlFileNames) => {
                const xmlFileNamePaths = _.map(xmlFileNames, (file) => {
                    return path.resolve(CONFIG_PATH, manifestConfig.source, file);
                });
                return tagNameExtractor(xmlFileNamePaths,
                  path.resolve(CONFIG_PATH, manifestConfig.target), '-manifest-tag');
            })
            .then(() => {
                log.info('Extracted manifest tag names for all XML files at ' +
                          path.resolve(CONFIG_PATH, manifestConfig.source));
            })
            .catch((e) => {
                log.error(e);
            });
    }).then(() => {
        return Promise.resolve();
    }).catch((e) => {
        log.error(e);
        return Promise.reject(e);
    });
});
