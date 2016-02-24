###
Disconnection command, unhooks from your GRBL.

If you are connected, and connect to a different port, you will
be disconnected automatically. -- one port at a time!

If you need to have multiple GRBL connections run grbl-cli multiple times
in different shells.
###

Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'disconnect',
      'Disconnect from your GRBL device'
    .action (args) ->
      vorpal.GRBL?.close()
      delete vorpal.GRBL
      Promise.resolve()
