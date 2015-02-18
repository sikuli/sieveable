var cheerio = require('cheerio'),
    _ = require('lodash')

function check(node, prefix) {
    // console.log(node)

    if (node.type === 'tag'){
        if (node.name.match(prefix)){            
            console.log(prefix, '-->', node.name)
            return true
        }
    }

    var children = node.children
    if (children){ 
       return _.some(children, function(x){
            return check(x, prefix)
       })
    }
    
}

module.exports = function(apps) {

    console.log('Find custom UI widgets')

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml)

        var packageName = $('App').attr('name')

        check($.root()[0], packageName)
    })

    return 'done'
}