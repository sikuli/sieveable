var _ = require('lodash');
var path = require('path');
var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var fs = require("fs");
var config = require("config");
var log = require("../logger");

function FileIndexingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = "FileIndexingError";
    //Error.captureStackTrace(this, FaileIndexingError);
}
FileIndexingError.prototype = Object.create(Error.prototype);
FileIndexingError.prototype.constructor = FileIndexingError;

function index(fileNames, extention, collectionName, callback) {
    var solr_extract_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + collectionName + '/update/extract';
    log.info("Indexing %d files in the %s collection.", fileNames.length,
        collectionName)
    Promise.map(fileNames, function (fileName) {
        var appInfo = path.basename(fileName, extention).split('-');
        var package_name = appInfo[0];
        var version_code = appInfo[1];
        var app_id = package_name + "-" + version_code;
        var solrUpdateParams = {
            "literal.id": app_id,
            "literal.package_name": package_name,
            "literal.version_code": Number(version_code),
            "wt": "json",
            my_file: {
                value: fs.createReadStream(fileName),
                options: {
                    contentType: 'text/plain'
                }
            }
        };

        return request.postAsync({
            url: solr_extract_url,
            formData: solrUpdateParams
        }).get(1)
            .then(function (body) {
                var resHeader = JSON.parse(body).responseHeader;
                if (resHeader.status == 0) {
                    log.info("Successfully updated %s-%s", package_name,
                        version_code);
                }
                else {
                    throw new FileIndexingError("File indexing failed. " +
                        "Response Header: " + JSON.stringify(resHeader), fileName);
                }
            })
            .catch(FileIndexingError, function (e) {
                log.error('Indexing error. ' + e.message);
                throw e;
            })
    }, {concurrency: 1}).then(function () {
        return commit(collectionName)
    }).then(function () {
        callback(null);
    }).catch(FileIndexingError, function (e) {
        log.error("Failed to update %s. %s", e.fileName, e.message);
        callback(e);
    }).catch(function (e) {
        callback(e);
    })
}

function commit(collectionName) {
    var solr_update_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + collectionName + '/update'
    // commit all pending updates
    return request.postAsync({
        headers: {'content-type': 'application/json'},
        url: solr_update_url,
        qs: {"commit": 'true', "wt": "json"}
    }).get(1)
        .then(function (body) {
            var resHeader = JSON.parse(body).responseHeader;
            if (resHeader.status == 0) {
                log.info("Successfully committed all pending operations.");
                //callback(null);
                return;
            }
            else {
                throw new Error('Failed to commit pending updates. Response: ' +
                    JSON.stringify(resHeader));
            }
        })
        .catch(function (e) {
            log.error(e.message);
            return Promise.reject(e);
        });
}

module.exports = {
    index: index, commit: commit
};