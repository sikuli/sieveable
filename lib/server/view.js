var express = require('express')
var router = express.Router()
var fs = require('fs')
var pd = require('pretty-data').pd;

module.exports = function() {

    router.get('/xml/:id/:version', function(req, res) {

        var xmlPath = 'data/ui-xml/' + req.params.id + '-' + req.params.version + '.xml'
        fs.readFile(xmlPath, 'utf8', function(err, data){            
            var xml_pp = pd.xml(data)
            res.render('xml', {xml: xml_pp})    
        })    
    })

    router.get('/perm', function(req, res) {

        var xmlPath = 'datasets/apac/perm/' + req.params.id + '.json'
        fs.readFile(xmlPath, 'utf8', function(err, data){
            //var xml_pp = pd.xml(data)
            res.render('xml', {xml: 'hi'})
        })
    })

    return router
}