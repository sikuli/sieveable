#!/usr/bin/env node

var program = require('commander'),
    fs = require('fs'),
    parse = require('../lib/parse');

var ensureFileExists = function (file) {
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
    .action(function (xml_file) {
        ensureFileExists(xml_file);

        var text = fs.readFileSync(xml_file, 'utf8')
        var q = parse(text);
        console.log(q)
    });
program
    .command('*')
    .action(function (env) {
        console.error('Error: Unknown command.');
        program.help();
    });

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}

