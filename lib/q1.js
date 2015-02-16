var cheerio = require('cheerio')

module.exports = function(apps){

    console.log('how many linearlayouts does each app have?')

    // console.log(apps)
// 
    // var app = apps[0]

    apps.forEach(function (app){
        var $ = cheerio.load(app.xml)
        var answer = $('LinearLayout').length

        console.log($('App').attr('name'))
        console.log(answer)

    })

    

    return 'some answer'
}