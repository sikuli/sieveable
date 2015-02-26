var cheerio = require('cheerio'),
    _ = require('lodash')

var getSpecialDirs = function(app, dir_prefix) {
    var dirs = app('Directory');
    var foundDirs = _.filter(dirs, function(d) {
        return _.startsWith(d.attribs['directory_name'], dir_prefix);
    });
    return foundDirs
}

var doQ9 = function(app, dirName) {
    var gvNodes = "Directory[directory_name='" + dirName + "'] > File GridView";
    var found = false;
    _.forEach(app(gvNodes).siblings(), function(s){
        if(s.type == 'tag' && s.children && s.children.length > 1){
            var count = 0;
            _.forEach(s.children, function(h){
                if (h.type == 'tag'){
                    count ++;
                }
            });
            if(count > 1){
                found = true;
            }
        }
    });
    return found
}

module.exports = function(apps, callback) {
    console.log('Find apps that use a GridView, which has a sibiling ' +
        'ViewGroup that has at least one child View?');
    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml, {
            recognizeSelfClosing: true,
            xmlMode: true
        });
        var packageName = $('App').attr('name');
        var versionCode = $('App').attr('version_code');
        var result = false
        _(getSpecialDirs($, 'layout')).forEach(function(dir) {
            result = doQ9($, dir.attribs['directory_name'], packageName, versionCode);
            if(result == true){
                return false;
            }
        }).value();
        console.log(packageName + ', version: ' + versionCode + ', use: ' +
            Boolean(result).toString());
        console.log('------------------------------------------------------')
    })
    callback(null, 'done');
}