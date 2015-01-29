var debug = require('debug')('search')

var _ = require('lodash')

module.exports = search

function search(q, callback) {
    debug("Query: %o", q)


    for (key in q) {

        if (key === 'packageName') {

            packageName(q[key], callback)

        } else{

        	callback(key + " is not supported")
        }
    }

    // callback("not yet implemented")
}


var glob = require("glob")

function packageName(name, callback) {

    glob("data/unpacked-apps/*", function(er, files) {

        var results = []
        _.forEach(files, function(f) {
            if (f.match(name)){

            	var app = {
            		packageName: name,
            		localPath: f
            	}     
            	results.push(app)       	
            }
        })

        callback(null, results)
    })

}