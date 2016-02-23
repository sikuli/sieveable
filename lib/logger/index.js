const winston = require('winston'),
  DailyRotateFile = require('winston-daily-rotate-file'),
  config = require('config'),
  transports = config.get('logger.transports'),
  logger = new(winston.Logger)({
    transports: [
      new(winston.transports.Console)({
        name: 'sieveable-info',
        level: 'info'
      }),
      new DailyRotateFile({
        name: 'sieveable-error',
        datePattern: '.yyyy-MM-dd', // Rotate logs daily.
        level: 'error',
        filename: transports.file.path
      })
    ]
  });


/* Loggly logger
 * The subdomain and token values must be stored in environment variables whose
 * names are defined in the respected config file.
 */
if (transports.loggly) {
  require('winston-loggly');
  const logglyOptions = {
    subdomain: process.env[transports.loggly.subdomainEnvVar],
    inputToken: process.env[transports.loggly.inputTokenEnvVar],
    json: true,
    level: 'error',
    tags: transports.loggly.tags
  };
  logger.add(winston.transports.Loggly, logglyOptions);
}

module.exports = logger;
