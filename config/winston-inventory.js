const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

let date = new Date();

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/inventory/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports = logger;
