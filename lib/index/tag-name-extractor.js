'use strict';
const sax = require('sax'),
    fs = require('fs'),
    path = require('path'),
    Promise = require('bluebird'),
    log = require('../logger'),
    strict = true;
sax.MAX_BUFFER_LENGTH = 128 * 1024;

function FileExtractingError(message, fileName) {
    this.message = message;
    this.fileName = fileName;
    this.name = 'FileExtractingError';
}
FileExtractingError.prototype = Object.create(Error.prototype);
FileExtractingError.prototype.constructor = FileExtractingError;

module.exports = function extractTagName(xmlFileNames, targetDir, postfix, callback) {
    log.info('Extracting node tags and attributes for %d files to %s',
        xmlFileNames.length, targetDir);
    Promise.map(xmlFileNames, (xmlFile) => {
        const outFile = path.resolve(targetDir, path.basename(xmlFile, '.xml') +
            postfix + '.txt'),
            readStream = fs.createReadStream(xmlFile, { encoding: 'utf8' }),
            writeStream = fs.createWriteStream(outFile, { encoding: 'utf8' });
        return extract(xmlFile, readStream, writeStream)
            .then((res) => {
                log.info(res);
            })
            .catch(FileExtractingError, (e) => {
                log.error('FileExtractingError in ' + e.fileName + ' , ' + e.message);
                fs.unlink(outFile);
            })
            .catch((e) => {
                log.error(e);
            });
    }, { concurrency: 1 }).then(() => {
        callback(null);
    }).catch(FileExtractingError, (e) => {
        log.error('Failed to extract tag names for %s. %s', e.fileName, e.message);
        callback(e);
    });
};

function extract(fileName, readStream, writeStream) {
    function entity(str) {
        return str.replace('"', '&quot;');
    }
    return new Promise((resolve, reject) => {
        const saxStream = sax.createStream(strict, {
            lowercasetags: true,
            trim: true
        })
            .on('error', (e) => {
                reject(new FileExtractingError('SAX Parser Error. Reason: ' +
                    e.message, fileName));
            }).on('opentag', (node) => {
                readStream.pause();
                write(node.name + '\n');
                for (const i of node.attributes) {
                    write(node.name + "(" + i + "=\"" +
                        entity(node.attributes[i]) + "\")\n");
                }
                readStream.resume();
            }).on('end', () => {
                writeStream.end();
            }).on('end', () => {
            });

        function write(string) {
            if (!writeStream.write(string)) {
                readStream.pause();
            }
        }

        writeStream.on('drain', () => {
            readStream.resume();
        });

        writeStream.on('finish', () => {
            resolve('Node tags and attributes have been extracted from ' + fileName);
        });

        writeStream.on('error', (error) => {
            reject(new FileExtractingError('Failed to write output file. ' +
                ' Reason: ' + error.message, fileName));
        });

        readStream.on('error', (error) => {
            log.error('An error has occurred while reading from file.'
                + ' Reason: ' + error.message);
            reject(error);
        });

        readStream.pipe(saxStream);
    });
}
