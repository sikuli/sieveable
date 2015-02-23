var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findViews = function(app, dirName, view, childView) {
    var pattern = "Directory[directory_name='" + dirName + "'] > File " +
        view + ' ' + childView
    return app(pattern).length;
}

module.exports = function(apps, callback) {
    console.log('Find apps that use tab layouts with TabHost for navigation?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');

        var total = 0;
        _(getSpecialDirs($, 'layout')).forEach(function(dir) {
            var total = findViews($, dir.attribs['directory_name'],
                'TabHost', 'TabWidget');
            console.log(packageName + ', version: ' + versionCode + ', use: ' +
                Boolean(total).toString(), ', total: ' + total);
        }).value();
    })
    callback(null, 'done');
}