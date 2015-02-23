var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findViews = function(app, dirName, suffix) {
    var views = [];
    var items = app('Directory[directory_name=' + dirName + '] > File *');
    _(items).forEach(function(element) {
        if (element.type == 'tag' && _.endsWith(element.name.toLowerCase(), suffix) &&
            element.children.length >= 2) {
            views.push(element.name);
        } else if (element.type == 'tag' && element.name == 'view') {
            if (element.attribs['class'] &&
                _.endsWith(element.attribs['class'].toLowerCase(), suffix) &&
                element.children.length >= 2) {
                views.push(element.name);
            }
        }
    }).value();
    return views;
}

module.exports = function(apps, callback) {
    console.log('Find the number of navigation drawers for each app?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');

        var total = 0;
        _(getSpecialDirs($, 'layout')).forEach(function(dir) {
            var drawerViews = findViews($, dir.attribs['directory_name'],
                'widget.drawerlayout');
            total += drawerViews.length;
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', total: ' + total)
    })
    callback(null, 'done');
}