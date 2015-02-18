var cheerio = require('cheerio'),
    _ = require('lodash')

module.exports = function(apps, n) {

    console.log('Find different groups of apps, each group contains a list of verions of the same package')

    var a = []

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml)

        var packagename = $('App').attr('name')
        var version_code = $('App').attr('version_code')
        console.log(packagename)

        a.push({packagename: packagename, versioncode: version_code})
    })

    console.log(_.groupBy(a, 'packagename'))

    return 'done'
}