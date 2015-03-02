var cheerio = require('cheerio'),
	fs = require('fs'),
	_ = require('lodash');

var getLocals = function(fileContent) {
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
var detectQuestion = function($) {
	var root = $.root();
	var childTags = new Array();
	// if the root elelemnt has children
	if (root.type == 'tag' && hasChildren(root)) {
		// if the children has chidlren
		if (root.children && root.children.length > 1) {
			var nestedChildren = false;
			_.forEach(root.children(), function(c) {
				if (c.type == 'tag') {
					childTags.push(c.name);
				}
				if (c.type == 'tag' && c.children()) {
					nestedChildren = true;
				}
			});
		}
	}
	if (!nestedChildren) {
		// Root with Children
		var rootName = root.name
		var childrenLength = root.children.length
		var childrenNames =
	}
}

var getArguments = function($) {

}

var hasChildren = function(elem) {
	if (elem.type == 'tag' && elem.children && elem.children.length > 1) {
		return true
	}
}

module.exports = function(xmlFile, callback) {
	var fileContent = fs.readFileSync(xmlFile, 'utf8')
	var locals = getLocals(fileContent)
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
	var args = getArguments($)
	console.log($('X').children().length);
	callback('done', null);
}