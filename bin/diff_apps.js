#!/usr/bin/env node

var program = require('commander'),
    fs = require('fs'),
	parser = require('../lib/parser.js');

var ensureFileExists = function(file) {
	if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
		console.error('No such file, ' + file);
		process.exit(-1);
	}
}
program
	.version("0.0.1")
	.description("Android Apps Design Queries");

program
	.command("find <xml_file> ")
	.description("")
	.action(function(xml_file) {
		ensureFileExists(xml_file);
		parser(xml_file, function(result, error) {
			console.log(result);
		});
	});

program.parse(process.argv);

if (!program.args.length){
	program.help();
}