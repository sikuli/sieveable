var _ = require('lodash');
var path = require("path");
var xmldom = require('xmldom');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var log = require("../logger");
//var f1 = "./fixtures/ui/me.pou.app-188.xml";
//var f = "/Users/khalid/git/sieveable/test-1.xml";
//var expected = "./fixtures/examples/index/me.pou.app-188.expected.result.txt"

function FileExtractingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = "FileExtractingError";
    //Error.captureStackTrace(this, FileExtractingError);
}
FileExtractingError.prototype = Object.create(Error.prototype);
FileExtractingError.prototype.constructor = FileExtractingError;

module.exports = function (xmlFileNames, targetDir, callback) {
    log.info("Extracting parent-child tags (h1 index data) for %d files to %s",
        xmlFileNames.length, targetDir);
    Promise.map(xmlFileNames, function (xmlFile) {
        return extract(xmlFile, targetDir)
            .then(function (res) {
                log.info(res);
            });

    }, {concurrency: 1}).then(function () {
        callback(null, "Done");
    }).catch(FileExtractingError, function (e) {
        log.error("Failed to extract h1-index data for %s. %s", e.fileName, e.message);
        callback(e);
    });
}

function extract(xmlFile, targetDir) {
    return new Promise(function (resolve, reject) {
        var outFile = path.resolve(targetDir, path.basename(xmlFile, '.xml') +
            '-ui-h1.txt');
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
                reject(new Error('File node has more than one child. %s',
                    xmlFile));
            }
            var rootElement = rootElementList[0];
            var children = _.filter(rootElement.childNodes, function (child) {
                return child.nodeType === 1;
            });
            _.forEach(children, function (child) {
                doChildren(child, rootElement, writeStream);
            })
        });

        writeStream.on("finish", function () {
            resolve("H1 tags have been extracted for " + xmlFile);
        })
        writeStream.end();
    });
}

function doChildren(element, parent, writeStream) {
    if (element.hasChildNodes()) {
        emitPairs(parent, element, writeStream);
        var children = _.filter(element.childNodes, function (child) {
            return child.nodeType === 1;
        });
        _.forEach(children, function (child) {
            doChildren(child, element, writeStream)
        })
    }
    else {
        emitPairs(parent, element, writeStream);
    }
}

function emitPairs(parent, child, writeStream) {
    writeStream.write(parent.localName + "-" + child.localName + "\n");
    //var parentAttrs = getAttributes(parent);
    //console.log(parentAttrs.join('-'));
}

function getAttributes(elem) {
    return _.map(elem.attributes, function (attr) {
        var name = attr.nodeName;
        var value = attr.nodeValue;
        return name + "=" + value;
    })
}
