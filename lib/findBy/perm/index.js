var Promise = require('bluebird')
var inspect = require('eyes').inspector()
var _ = require('lodash')

var xml2js = Promise.promisifyAll(require('xml2js'));

module.exports = {
    init: init,
    find: find
}

function init(env){
    return Promise.resolve(env)
}

var _ = require('lodash')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

function unpickle(src){

    return fs.readFileAsync(src, 'utf8')
        .then(function(contents){

            var data = []
            var JSONPickle = function(o){
                data.push(o)
            }
            eval(contents)

            var gs = _.groupBy(data, '$type')
            return {
                appData: gs['edu.colorado.permgrep.appData'][0],
                perms: gs['edu.colorado.permgrep.onePerm']
            }
        })
}


function find(env, query, options) {

    return xml2js
        .parseStringAsync(query)
        .then(function(parsedQuery){
            return Promise.all(options.scope.map(_.partial(match, env, parsedQuery)))
        })
        .then(_.compact)
        .then(function(results){
            return results
        })
}

// q must be parsed
function match(env, q, item){

    var methodNamePattern  = q.callpath.$['from']
    var permissionPattern  = q.callpath.$['uses-permission'] || '.'

    return env.apps
        .get(item.id, {perm: true})
        .then(function(app){

            var o = app.perm

            var matches = _(o.perms)
                .map(function(p) {

                    var permission = p.permissions.elems[0].value

                    if (permission.match(permissionPattern)) {

                        var rs = _.map(p.path.elems, function (e) {
                            return e.methodName.methodName.match(methodNamePattern) ?
                                e : null
                        })

                        rs = _.compact(rs)
                        if (rs.length > 0) {
                            return {permission: p.permissions.elems, views: rs}
                        }
                    }
                })
                .compact()
                .value()

            if (matches.length > 0){
                item.perm = matches
                return item
            }
        })
}