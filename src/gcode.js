/*
REPL for direct GCODE entry. Pop into this mode and start typing raw
GCODE commands to enqueue to your GRBL.
*/

Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .mode('gcode')
    .description('Interactive GCODE mode')
    .delimiter('gcode>')
    .action(function(args){
      return Promise.resolve();
    })
}
