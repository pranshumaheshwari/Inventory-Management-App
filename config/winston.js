const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: './log/info.log' }),
    new transports.File({ filename: './log/error.log', level: 'error'})
  ]
});

// logger.log({
//   level: 'info',
//   message: 'Working'
// });

module.exports = logger;
// module.exports.stream = {
//   write: function(message, encoding){
//     logger.info(message);
//   }
// };