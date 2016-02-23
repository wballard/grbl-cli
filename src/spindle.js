/*
Play the contents of a file through to your GRBL. This assumes you will be
running with a spindle type cutter.
*/
"use strict";
Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('spindle <filename>', 'Run the context of a file with a spindle cutter')
    .action(function(args){
      return Promise.resolve();
    })
}
