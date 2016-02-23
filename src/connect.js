/*
Connection command, this sets up the actual serial line connection to your
GRBL device and hooks up a reactive event flow for messages to and from
the serial port with a line oriented style.
*/

"use strict";
var Promise = require('bluebird');
var GRBL = require('./grbl');
var serialport = require("serialport");
var Rx = require('rx');
var messages = require('./messages');

module.exports = function(vorpal, options) {
  vorpal
    .command('connect <port>', 'Connect over serial to a GRBL device')
    .option('-b, --baudrate [baudrate]', 'Bits per second, defaults 115200 for latest GRBL')
    .autocomplete(function() {
      return Promise
        .promisify(serialport.list)()
        .map( (port) => `${port.comName}`.split('/')[2] )
    })
    .validate(function(args){
      if(vorpal.GRBL) {
        return messages.error('You are already connected, disconnect first.');
      } else {
        return true;
      }
    })
    .action(function(args){
      args.action = 'connect';
      args.options.baudrate = Number(args.options.baudrate || 115200);
      let grblPort = new serialport.SerialPort(
          `/dev/${args.port}`
          ,{
            parser: serialport.parsers.readline("\n")
            ,baudrate: args.options.baudrate
          }
      );
      vorpal.GRBL = new GRBL(vorpal, grblPort);
      return Promise.resolve();
    })
}
