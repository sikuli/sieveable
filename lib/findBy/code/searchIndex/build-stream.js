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

function index(files) {
    var solr_extract_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + config.get("dbConfig.solr.collection") + '/update/extract'

    _.forEach(files, function (textFile) {
        var appInfo = path.parse(textFile).name.slice(0, -6).split('-');
        var package_name = appInfo[0];
        var version_code = appInfo[1];
        var app_id = package_name + "-" + version_code;


        solrUpdateParams = {
            "literal.id": app_id,
            "literal.package_name": package_name,
            "literal.version_code": Number(version_code),
            my_file: {
                value: fs.createReadStream(textFile),
                options: {
                    contentType: 'text/plain'
                }
            },
            "wt": "json"
        }

        request.postAsync({
            url: solr_extract_url,
            formData: solrUpdateParams
        }).get(1).then(function (body) {
            var resHeader = JSON.parse(body).responseHeader;
            log.info(body);
            if (resHeader.status == 0) {
                log.info("Successfully updated %s-%s", package_name, version_code)
            }
            else {
                throw Error('Status ' + resHeader.status);
            }
        }).catch(clientError, function (e) {
            log.error("Failed to update %s-%s %s", package_name,
                version_code, e.message);
        });

    });

}

function commit() {
    var solr_update_url = 'http://' + config.get("dbConfig.solr.host") + ':' +
        config.get("dbConfig.solr.port") +
        '/solr/' + config.get("dbConfig.solr.collection") + '/update'
    // commit all pending updates
    request.postAsync({
        headers: {'content-type': 'application/json'},
        url: solr_update_url,
        qs: {"commit": 'true', "wt": "json"}
    }).get(1).then(function (body) {
        var resHeader = JSON.parse(body).responseHeader;
        if (resHeader.status == 0) {
            log.info("Successfully committed all pending operations.")
        }
        else {
            throw Error('Status ' + resHeader.status);
        }
    }).catch(clientError, function (e) {
        log.error("Failed to commit pending updates %s", e.message);
    });
}
module.exports = {
    index: index, commit: commit
};