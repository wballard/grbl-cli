/*
Disconnection command, unhooks from your GRBL.

If you are connected, and connect to a different port, you will
be disconnected automatically. -- one port at a time!

If you need to have multiple GRBL connections run grbl-cli multiple times
in different shells.
*/

"use strict";
var Promise = require('bluebird');
var serialport = require('serialport')

module.exports = function(vorpal, options) {
  vorpal
    .command('disconnect', 'Disconnect from your GRBL device')
    .action(function(args){
      vorpal.immediate({action: 'close'});
      return Promise.resolve();
    })
}
