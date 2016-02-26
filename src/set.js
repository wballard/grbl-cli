/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/
Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('set [register] [value]', 'Set GRBL parameter registers')
    .action(function(args){
      return Promise.resolve();
    })
}
