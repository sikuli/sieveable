var _ = require('lodash');
var path = require("path");
var xmldom = require('xmldom');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var log = require("../logger");

function FileExtractingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = "FileExtractingError";
    //Error.captureStackTrace(this, FileExtractingError);
}
FileExtractingError.prototype = Object.create(Error.prototype);
FileExtractingError.prototype.constructor = FileExtractingError;

module.exports = function (xmlFileNames, targetDir, callback) {
    log.info("Extracting suffix paths (root-to-leaf paths) for %d files to %s",
        xmlFileNames.length, targetDir);
    Promise.map(xmlFileNames, function (xmlFile) {
        return extract(xmlFile, targetDir)
            .then(function (res) {
                log.info(res);
            })
            .catch(FileExtractingError, function (e) {
                log.error("FileExtractingError in %s, %s", e.fileName, e.message)
            })
            .catch(function (e) {
                log.error(e)
            });

    }, {concurrency: 1}).then(function () {
        callback(null, "Done");
    }).catch(FileExtractingError, function (e) {
        log.error("Failed to extract suffix paths for %s. %s", e.fileName, e.message);
        callback(e);
    });
}

function extract(xmlFile, targetDir) {
    return new Promise(function (resolve, reject) {
        var outFile = path.resolve(targetDir, path.basename(xmlFile, '.xml') +
            '-ui-suffix.txt');
        var writeStream = fs.createWriteStream(outFile, {encoding: "utf8"});
        var xmlFileContent = fs.readFileSync(xmlFile, "utf8");
        var doc = new xmldom.DOMParser().parseFromString(xmlFileContent,
            "text/xml");
        var fileElements = doc.getElementsByTagName('File');
        _.forEach(fileElements, function (fileElement) {
            var rootElementList = _.filter(fileElement.childNodes, function (child) {
                return child.nodeType === 1;
            });
            // Each layout file must contain exactly one root element.
            if (rootElementList.length != 1) {
                fs.unlinkSync(outFile);
                reject(new FileExtractingError('File node ' +
                    fileElement.attributes[0].nodeValue + ' has more than one child. ',
                    xmlFile));
            }
            var rootElement = rootElementList[0];
            var children = _.filter(rootElement.childNodes, function (child) {
                return child.nodeType === 1;
            });
            _.forEach(children, function (child) {
                doChildren(child, writeStream);
            })
        });

        writeStream.on("finish", function () {
            resolve("Suffix paths have been extracted for " + xmlFile);
        })
        writeStream.end();
    });
}

function doChildren(element, writeStream) {
    if (element.hasChildNodes()) {
        //writeAncestors(parent, writeStream);
        var children = _.filter(element.childNodes, function (child) {
            return child.nodeType === 1;
        });
        if (children.length === 0) {
            writeAncestors(element, writeStream);
        }
        _.forEach(children, function (child) {
            doChildren(child, writeStream)
        })
    }
    else {
        writeAncestors(element, writeStream);
    }
}

function writeAncestors(element, writeStream) {
    var ancestors = [];
    var childName = element.localName;

    while (element.parentNode && element.parentNode.localName != 'File') {
        element = element.parentNode;
        if (element.nodeType === 1) {
            ancestors.push(element.localName);
        }
    }
    var line = "";
    for (var i = ancestors.length - 1; i > -1; i--) {
        line += ancestors[i] + "$";
    }
    line += childName;
    writeStream.write(line + "\n");

    var arr = line.split('$');
    if (arr.length > 2) {
        arr.forEach(function (v, k) {
            if (k != arr.length - 1) {
                writeStream.write(arr[k] + "$" + arr[k + 1] + "\n");
            }
        });
    }
}
