var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var doQ9 = function(app, dirName, view, siblingView) {
    var appView = "Directory[directory_name='" + dirName + "'] > File";
    app(appView).find(view).parent().children().each(function(i, elem) {
        console.log('wait...');
        if (elem.name == siblingView) {
            console.log('Found')
            return true;
        }
    });
}

module.exports = function(apps, callback) {
    console.log('Find apps that use a GridView, which has a sibiling ' +
        'ViewGroup that has at least one child View?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        var result
        _(getSpecialDirs($, 'layout')).forEach(function(dir) {
            result = doQ9($, dir.attribs['directory_name'],
                'GridView');
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', use: ' +
            Boolean(result).toString());
    })
    callback(null, 'done');
}