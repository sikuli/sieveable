var cheerio = require('cheerio'),
    _ = require('lodash')

module.exports = function(apps) {

    console.log('Find ViewGroups with mulitple buttons (> n) as direct children')

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml)

        $('Button').each(function(){

            var btns = $(this).siblings('Button')
            if (btns.length > 18){
                console.log($(this).parents('App').attr('name'))
                console.log(btns.length)   
                console.log(this.parent)
                console.log(this.attribs['android:id'])          
            }

        })

        // check($.root()[0], packageName)
    })

    return 'done'
}