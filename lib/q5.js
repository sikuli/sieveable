var cheerio = require('cheerio'),
    _ = require('lodash');

module.exports = function(apps, n) {

    console.log('Find ViewGroups with mulitple buttons (> ' + n + ')' +
        ' as direct children');

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);

        $('Button').each(function(){

            var btns = $(this).siblings('Button');
            if (btns.length > n){
                var packageName = $(this).parents('App').attr('name');
                var versionCode = $(this).parents('App').attr('version_code');
                console.log(packageName + ', version: ' + versionCode + 
                    ', total: ' + btns.length);
            }

        })
    })

    return 'done';
}