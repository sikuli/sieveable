var cheerio = require('cheerio'), fs = require('fs'), _ = require('lodash');

// Get locals (variables and their values) from the example xml query file.
function getLocals(fileContent) {
    var locals = new Array()
    fileContent.split('\n').forEach(function(line) {
        line = line.trim()
        if (_.startsWith(line, '<') &&
        _.endsWith(line, '>')) {
            return;
        } else if (line.length > 2 && line.indexOf('=') > 0) {
            var localsPair = line.split('=')
            var l = {};
            l[localsPair[0].trim()] = localsPair[1].trim()
            locals.push(l);
        }
    });
    return locals
}
function detectQuestion($) {
    var root = $.root();
    var childTags = new Array();
    var hasNestedChildren = false;
    var rootHasChildren = false;
    // if the root elelemnt has children
    if (root.type == 'tag' && hasChildren(root)) {
        rootHasChildren = true;
        // if the children has chidlren
        if ('children' in root && root.children().length > 1) {
            _.forEach(root.children(), function(c) {
                if (c.type == 'tag') {
                    childTags.push(c.name);
                    if(c.children()) {
                         nestedChildren = true;
                    }
                }
            })
        }
    }
    if(rootHasChildren == true && nestedChildreni == false){
        return 'q5'
    }
    else if(rootHasChildren == true && nestedChildren == true){
        return undefined
    }
}

function getiQ5Arguments($) {

}

function hasChildren(elem) {
    if (elem.type == 'tag' && 'children' in elem && elem.children().length > 1) {
        return true;
    }
    return false;
}

module.exports = function(xmlFile, callback) {
    var fileContent = fs.readFileSync(xmlFile, 'utf8');
    var locals = getLocals(fileContent);
    for (index in locals) {
        for (var propertyName in locals[index]) {
            console.log(propertyName + '=>' + locals[index][propertyName]);
        }
    }
    var $ = cheerio.load(fileContent, {
        recognizeSelfClosing: true,
        xmlmode: true
    });
    var question = detectQuestion($)
    console.log(question)
    //var args = getArguments($)
    callback('done', null);
}
