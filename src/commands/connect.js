"use strict";
/*
Connection command, this sets up the actual serial line connection to your
GRBL device and hooks up a reactive event flow for messages to and from
the serial port with a line oriented style.
*/

let Promise = require("bluebird")
  , GRBL = require("../grbl.js")
  , messages = require("../messages.js")
  , serialport = require("serialport");

module.exports = function(vorpal) {
  vorpal
    .command("connect <port>", "Connect over serial to a GRBL device")
    .option("-b, --baudrate [baudrate]", "Bits per second, defaults 115200 for latest GRBL")
    .autocomplete(function() {
      return Promise
        .promisify(serialport.list)()
        .map((port) => `${port.comName}`.split("/")[2]);
    })
    .validate(function() {
      return messages.disconnect(vorpal);
    })
    .action(function(args) {
      args.options.baudrate = Number(args.options.baudrate || 115200);
      let grblPort = new serialport.SerialPort(
        `/dev/${args.port}`,
        {
          parser: serialport.parsers.readline("\n")
          , baudrate: args.options.baudrate
        },
        false
      );
      vorpal.GRBL = new GRBL(vorpal, grblPort);
      return new Promise(function(resolve, reject) {
        grblPort.open(function(error) {
          if (error)
            reject(error);
          else
            resolve("connected");
        });
      });
    });
};