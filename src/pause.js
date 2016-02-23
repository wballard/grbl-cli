/*
Pause the current program run. This will leave the spindle powerered.
*/
Promise = require('bluebird');
serialport = require('serialport');

module.exports = function(vorpal, options) {
  vorpal
    .command('pause', 'Pause current program run')
    .action(function(args){
      return Promise.resolve();
    })
}
