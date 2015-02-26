var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var findSearchViews = function($, dirName, elementName, childName,
    attributeName, attributeValue) {
    var searchViews = [];
    var menu = 'Directory[directory_name=' + dirName + '] > File ' + elementName;
    _.forEach($(menu).children(childName), function(c) {
        if (c.type == 'tag') {
            _.forOwn(c.attribs, function(value, key) {
                if (_.endsWith(key, attributeName.toLowerCase()) &&
                    _.endsWith(value, attributeValue)) {
                    searchViews.push(attributeValue)
                }
            });
        }
    });
    return searchViews;
}

module.exports = function(apps, callback) {
    console.log('Find the number SearchViews used as action views in the Action Bar?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        var total = 0;
        _(getSpecialDirs($, 'menu')).forEach(function(dir) {
            var searchViews = findSearchViews($, dir.attribs['directory_name'],
                'menu', 'item', 'actionViewClass',
                '.widget.SearchView');
            total += searchViews.length;
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', usage: ' + Boolean(total).toString() + ', total: ' + total)
    })
    callback(null, 'done');
}