/*
Resume the current program run.
*/
Promise = require('bluebird');
serialport = require('serialport');

module.exports = function(vorpal, options) {
  vorpal
    .command('resume', 'Resume current program run')
    .action(function(args){
      return Promise.resolve();
    })
}
