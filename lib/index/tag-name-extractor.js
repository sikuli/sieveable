var sax = require("sax");
var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");
var log = require("../logger");
var strict = true;
var parser = sax.parser(strict);

function FileExtractingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = "FileExtractingError";
    //Error.captureStackTrace(this, FileExtractingError);
}
FileExtractingError.prototype = Object.create(Error.prototype);
FileExtractingError.prototype.constructor = FileExtractingError;

module.exports = function (xmlFileNames, targetDir, callback) {
    log.info("Extracting node tags and attributes for %d files to %s",
        xmlFileNames.length, targetDir);
    Promise.map(xmlFileNames, function (xmlFile) {
        var outFile = path.resolve(targetDir, path.basename(xmlFile, '.xml') +
            '-ui-tag.txt');
        var readStream = fs.createReadStream(xmlFile, {encoding: "utf8"});
        var writeStream = fs.createWriteStream(outFile, {encoding: "utf8"});
        return extract(xmlFile, readStream, writeStream)
            .then(function (res) {
                log.info(res);
            });

    }, {concurrency: 1}).then(function () {
        callback(null);
    }).catch(FileExtractingError, function (e) {
        log.error("Failed to extract tag names for %s. %s", e.fileName, e.message);
        callback(e);
    });

}

function extract(fileName, readStream, writeStream) {

    function entity(str) {
        return str.replace('"', '&quot;');
    }

    return new Promise(function (resolve, reject) {
        var saxStream = sax.createStream(strict, {
            lowercasetags: true,
            trim: true
        })
            .on("error", function (e) {
                console.error("SAX Parser Error. Reason: ", e);
                // clear the error
                this._parser.error = null;
                this._parser.resume();
            }).on("opentag", function (node) {
                write(node.name + "\n")
                for (var i in node.attributes) {
                    write(node.name + "(" + i + "=\"" +
                        entity(node.attributes[i]) + "\")\n");
                }
            }).on('end', function () {
                writeStream.end();
            });

        function write(string) {
            if (!writeStream.write(string)) {
                readStream.pause();
            }
        }

        writeStream.on("drain", function () {
            readStream.resume();
        });

        writeStream.on("finish", function () {
            resolve("Node tags and attributes have been extracted from " +
                fileName);
        });

        writeStream.on("error", function (error) {
            console.error("An error has occurred while writing to file."
                + " Reason: " + error.message);
            reject(new FileExtractingError("Failed to write output file for " +
                fileName));
        });

        readStream.on("error", function (error) {
            log.error("An error has occurred while reading from file."
                + " Reason: " + error.message);
            reject(error);
        });

        readStream.pipe(saxStream);
    });
}