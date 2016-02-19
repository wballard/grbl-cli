/*
Connection command, this sets up the actual serial line connection to your
GRBL device and hooks up a reactive event flow for messages to and from
the serial port with a line oriented style.
*/
Promise = require('bluebird');
serialport = require('serialport');

module.exports = function(vorpal, options) {
  vorpal
    .command('connect <port>', 'Connect over serial to a GRBL device')
    .option('-b, --baudrate [baudrate]', 'Bits per second, defaults 115200 for latest GRBL')
    .autocomplete(function() {
      return Promise
        .promisify(serialport.list)()
        .map( (port) => `${port.comName}`.split('/')[2] )
    })
    .action(function(args){
      this.log(args);
      return Promise.resolve();
    })
}
