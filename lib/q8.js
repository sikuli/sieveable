var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findSiblingViews = function(app, dirName, view, siblingView) {
    var appView = "Directory[directory_name='" + dirName + "'] > File";
    var result = false
    app(appView).find(view).siblings(siblingView.toLowerCase()).each(function(i, elem) {
        if (elem.name == siblingView.toLowerCase()) {
            result = true;
        }
    });
    return result
}

module.exports = function(apps, callback) {
    console.log('Find apps that use a ViewGroup with an ImageView and ' +
        'a RatingBar elemenets as descendant?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml, {
            recognizeSelfClosing: true
        });
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        // var result
        var result =
            _(getSpecialDirs($, 'layout'))
            .some(function(dir) {
                return findSiblingViews($, dir.attribs['directory_name'],
                    'RatingBar', 'ImageView');
            })

        console.log(packageName + ', version: ' + versionCode + ', use: ' +
            Boolean(result).toString());
    })
    callback(null, 'done');
}