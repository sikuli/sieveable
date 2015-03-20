var DB = require('./DB')

function open() {
    var db = new DB()
    return db.init()    
}

module.exports = {
    open: open
}
