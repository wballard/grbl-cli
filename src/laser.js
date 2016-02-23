/*
Play the contents of a file through to your GRBL. This assumes you will be
running with a laser type cutter. Laser cutters will not burn during rapid moves,
so the GCODE is processed to enable/disable around each move.
*/
Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('laser <filename>', 'Run GCODE from a file, adjusted to run with a laser')
    .action(function(args){
      return Promise.resolve();
    })
}
