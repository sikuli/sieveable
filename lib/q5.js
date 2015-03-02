var cheerio = require('cheerio'),
    _ = require('lodash');

module.exports = function(apps, viewGroup, view, n) {

    console.log('Find viewGroups with mulitple views (> ' + n + ')' +
        ' as direct children');

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);

        $(view).each(function(){
            var btns
            if(viewGroup == undefined){
                btns = $(this).siblings(view);
            }
            else{
                btns = $(viewGroup).siblings(view);
            }
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