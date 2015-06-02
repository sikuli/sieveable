var _ = require('lodash');
var path = require('path');
var Promise = require("bluebird");
var request = Promise.promisifyAll(require("request"));
var fs = require("fs");
var config = require("config");
var log = require("../../../logger");

function clientError(e) {
    return e.code != 200;
}

function FileIndexingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = "MyCustomError";
    //Error.captureStackTrace(this, FaileIndexingError);
}
FileIndexingError.prototype = Object.create(Error.prototype);
FileIndexingError.prototype.constructor = FileIndexingError;

function index(fileNames, callback) {
    var solr_extract_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + config.get("dbConfig.solr.collection") + '/update/extract';
    Promise.map(fileNames, function (fileName) {
        var appInfo = path.parse(fileName).name.slice(0, -6).split('-');
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
                    log.info("Successfully updated %s-%s", package_name, version_code);
                }
                else {
                    throw new FileIndexingError("File indexing failed. Response Header: " +
                        JSON.stringify(resHeader), fileName);
                }
            })
            .catch(FileIndexingError, function (e) {
                console.error('oops');
                throw e;
            })
    }, {concurrency: 1}).then(function () {
        callback(null);
    }).catch(FileIndexingError, function (e) {
        log.error("Failed to update %s. %s", e.fileName, e.message);
        callback(e);
    });
}

function commit(callback) {
    var solr_update_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + config.get("dbConfig.solr.collection") + '/update'
    // commit all pending updates
    request.postAsync({
        headers: {'content-type': 'application/json'},
        url: solr_update_url,
        qs: {"commit": 'true', "wt": "json"}
    }).get(1)
        .then(function (body) {
            var resHeader = JSON.parse(body).responseHeader;
            if (resHeader.status == 0) {
                log.info("Successfully committed all pending operations.");
                callback(null);
            }
            else {
                throw Error('Failed to commit pending updates. Response: ' +
                    JSON.stringify(resHeader));
            }
        })
        .catch(Error, function (e) {
            log.error(e.message);
            callback(e);
        });
}

module.exports = {
    index: index, commit: commit
};