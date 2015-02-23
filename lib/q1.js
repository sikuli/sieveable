var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findCustomViews = function(app, dirName, prefix) {
    var customViews = [];
    var children = app('Directory[directory_name=' + dirName + '] > File *');
    _(children).forEach(function(child) {
        if (child.type == 'tag' && _.startsWith(child.name, prefix)) {
            customViews.push(child.name);
        }
        else if(child.type == 'tag' && child.name == 'view'){
            if (child.attribs['class'] && child.attribs['class'].match(prefix)){
                customViews.push(child.name);
            }
        }
    }).value();
    return customViews;
}

module.exports = function(apps, callback) {
    console.log('Find the number of custom UI components for each app?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');

        var total = 0;
        _(getSpecialDirs($, 'layout')).forEach(function(dir){
            var customViews = findCustomViews($, dir.attribs['directory_name'], 
                packageName);
            total += customViews.length;
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', total: ' + total)
    })
    callback(null, 'done');
}