const _ = require('lodash'),
  path = require('path'),
  xmldom = require('xmldom'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  log = require('../logger');

function FileExtractingError(message, fileName) {
  this.message = message;
  this.fileName = fileName;
  this.name = 'FileExtractingError';
  // Error.captureStackTrace(this, FileExtractingError);
}
FileExtractingError.prototype = Object.create(Error.prototype);
FileExtractingError.prototype.constructor = FileExtractingError;

module.exports = function extractSuffixPaths(xmlFileNames, targetDir) {
  log.info('Extracting suffix paths (root-to-leaf paths) for %d files to %s',
    xmlFileNames.length, targetDir);
  return Promise.map(xmlFileNames, (xmlFile) => {
    return extract(xmlFile, targetDir)
        .then((res) => {
          log.info(res);
        })
        .catch(FileExtractingError, (e) => {
          log.error('UISuffixExtractorError in %s, %s', e.fileName, e.message);
        })
        .catch((e) => {
          log.error('UISuffixExtractorError in %s', xmlFile, e);
        });
  }, {
    concurrency: 1 })
    .then(() => {
      return Promise.resolve('Done');
    })
    .catch(FileExtractingError, (e) => {
      log.error('Failed to extract suffix paths for %s. %s', e.fileName, e.message);
      return Promise.reject(e);
    });
};

function extract(xmlFile, targetDir) {
  const outFile = path.resolve(targetDir,
      `${path.basename(xmlFile, '.xml')}-ui-suffix.txt`);
  return new Promise((resolve, reject) => {
    fs.readFileAsync(xmlFile, 'utf8')
    .then((xmlFileContent) => {
      const writeStream = fs.createWriteStream(outFile, { encoding: 'utf8' }),
        doc = new xmldom.DOMParser().parseFromString(xmlFileContent, 'text/xml'),
        fileElements = doc.getElementsByTagName('File');
      _.forEach(fileElements, (fileElement) => {
        const rootElementList = _.filter(fileElement.childNodes, (child) => {
          return child.nodeType === 1;
        });
        // Each layout file must contain exactly one root element.
        if (rootElementList.length !== 1) {
          throw new FileExtractingError(
              `File node ${fileElement.attributes[0].nodeValue} has more than one child. `,
              xmlFile);
        }
        const rootElement = rootElementList[0],
          children = _.filter(rootElement.childNodes, (child) => {
            return child.nodeType === 1;
          });
        _.forEach(children, (child) => {
          doChildren(child, writeStream);
        });
      });
      writeStream.on('finish', () => {
        resolve(`Suffix paths have been extracted for ${xmlFile}`);
      });
      writeStream.end();
    })
    .catch((e) => {
      return fs.unlinkAsync(outFile)
        .then(() => {
          reject(e);
        });
    });
  });
}

function doChildren(element, writeStream) {
  if (element.hasChildNodes()) {
    // writeAncestors(parent, writeStream);
    const children = _.filter(element.childNodes, (child) => {
      return child.nodeType === 1;
    });
    if (children.length === 0) {
      writeAncestors(element, writeStream);
    }
    _.forEach(children, (child) => {
      doChildren(child, writeStream);
    });
  }
  else {
    writeAncestors(element, writeStream);
  }
}
function getAncestorsLine(element) {
  'use strict';
  const ancestors = [],
    childName = element.localName;
  let line = '',
    newElement = element;
  while (newElement.parentNode && newElement.parentNode.localName !== 'File') {
    newElement = newElement.parentNode;
    if (newElement.nodeType === 1) {
      ancestors.push(newElement.localName);
    }
  }
  for (let i = ancestors.length - 1; i > -1; i--) {
    line += `${ancestors[i]}$`;
  }
  return line + childName;
}

function writeAncestors(element, writeStream) {
  const line = getAncestorsLine(element),
    arr = line.split('$');
  writeStream.write(`${line}\n`);
  if (arr.length > 2) {
    arr.forEach((v, k) => {
      if (k !== arr.length - 1) {
        writeStream.write(`${arr[k]}$${arr[k + 1]}\n`);
      }
    });
  }
}
