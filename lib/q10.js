var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findSearchViews = function(app, dirName) {
    var searchViews = [];
    var children = app('Directory[directory_name=' + dirName + '] > File *');
    _(children).forEach(function(child) {
        if (child.type == 'tag' && child.name == 'item') {
            if (child.attribs['android:resizemode'] != undefined){
                searchViews.push(child.name);
            }
        }
    }).value();
    return searchViews;
}

module.exports = function(apps, callback) {
    console.log('Find the number SearchViews used as action views in the Action Bar?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        var total = 0;
        _(getSpecialDirs($, 'xml')).forEach(function(dir){
            var searchViews = findSearchViews($, 
                dir.attribs['directory_name']);
            total += searchViews.length;
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', total: ' + total)
    })
    callback(null, 'done');
}