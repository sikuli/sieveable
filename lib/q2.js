var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findResizableWidgets = function(app, dirName) {
    var resizableWidgets = [];
    var children = app('Directory[directory_name=' + dirName + '] > File *');
    _(children).forEach(function(child) {
        if (child.type == 'tag' && child.name == 'appwidget-provider') {
            if (child.attribs['android:resizemode'] != undefined){
                resizableWidgets.push(child.name);
            }
        }
    }).value();
    return resizableWidgets;
}

module.exports = function(apps, callback) {
    console.log('Find the number of home screen widgets that support '+ 
        'resizing for each app?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        var total = 0;
        _(getSpecialDirs($, 'xml')).forEach(function(dir){
            var resizableWidgets = findResizableWidgets($, 
                dir.attribs['directory_name']);
            total += resizableWidgets.length;
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', total: ' + total)
    })
    callback(null, 'done');
}