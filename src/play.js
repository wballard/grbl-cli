/*
Play the contents of a file through to your GRBL.
*/
"use strict";
Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('play <filename>', 'Run all the GCODE in a file')
    .action(function(args){
      return Promise.resolve();
    })
}
