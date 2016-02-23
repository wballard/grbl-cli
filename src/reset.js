/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/
Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('reset', 'Reset the machine')
    .action(function(args){
      return Promise.resolve();
    })
}
