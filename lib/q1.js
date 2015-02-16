var cheerio = require('cheerio')

module.exports = function(apps){

    console.log('how many linearlayouts does each app have?')

    console.log(apps)

    var app = apps[0]

    var $ = cheerio.load(app.xml)

    var answer = $('LinearLayout').length

    return answer
}