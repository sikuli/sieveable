var fs = require('fs'),
    cheerio = require('cheerio')

var txt = fs.readFileSync('./data/ui-xml/com.outfit7.talkingtom2free-83.xml', 'utf8')

//$ = cheerio.load(txt)
var $ = cheerio.load(txt, {
    recognizeSelfClosing: true
})

// number of buttons
$("Button").length

var n = $('ImageView[layout_centerInParent="true"]')
    // console.log(n)

$('ImageView').filter(function() {

    // console.log(this.attribs['android:scaletype'])

    return this.attribs['android:scaletype'] === 'fitCenter'

}).each(function() {

    console.log(">>",  this.attribs['android:id'])

    $(this).parents('File').each(function(){
        console.log(this.attribs)
    })
})