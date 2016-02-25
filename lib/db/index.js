const DB = require('./DB');

function open() {
  const db = new DB();
  return db.init();
}

module.exports = { open };
