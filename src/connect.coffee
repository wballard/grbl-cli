###
Connection command, this sets up the actual serial line connection to your
GRBL device and hooks up a reactive event flow for messages to and from
the serial port with a line oriented style.
###

Promise = require('bluebird')
GRBL = require('./grbl.coffee')
serialport = require("serialport")
Rx = require('rx')
messages = require('./messages')

module.exports = (vorpal, options) ->
  vorpal
    .command 'connect <port>',
      'Connect over serial to a GRBL device'
    .option '-b, --baudrate [baudrate]',
       'Bits per second, defaults 115200 for latest GRBL'
    .autocomplete ->
      return Promise
        .promisify(serialport.list)()
        .map( (port) -> "#{port.comName}".split('/')[2] )
    .validate (args) ->
      if(vorpal.GRBL)
        return "You must #{vorpal.chalk.cyan('disconnect')} first"
      else
        return true
    .action (args) ->
      args.action = 'connect'
      args.options.baudrate = Number(args.options.baudrate || 115200)
      grblPort = new serialport.SerialPort(
        "/dev/#{args.port}",
        {
          parser: serialport.parsers.readline("\n")
          baudrate: args.options.baudrate
        }
      )
      vorpal.GRBL = new GRBL(vorpal, grblPort)
      Promise.resolve()
