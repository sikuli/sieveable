var winston = require('winston');
var config = require("config");

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            name: 'sieveable-info',
            level: 'info'
        }),
        new (winston.transports.DailyRotateFile)({
            name: 'sieveable-error',
            datePattern: '.yyyy-MM-dd', // Rotate logs daily.
            level: 'error',
            filename: config.get("logger.error.path")
        })
    ]
});

module.exports = logger;
