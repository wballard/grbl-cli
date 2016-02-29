###
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'reset', 'Reset the machine'
    .action ->
      vorpal.GRBL.immediate.onNext {action: 'reset', text: '\x18'}
      Promise.resolve()
