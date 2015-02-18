var cheerio = require('cheerio')

module.exports = function(apps){

    console.log('find a TabHost with at least one TabWidget as a descenent')

    apps.forEach(function (app){
        var $ = cheerio.load(app.xml)
        var answer = $('TabHost TabWidget').length

        if (answer > 0){
            console.log($('App').attr('name'))
            console.log(answer)
        }

    })

    

    return 'some answer'
}