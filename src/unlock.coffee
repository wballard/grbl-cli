###
Unlock the machine after an alarm.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'unlock', 'Unlock the machine'
    .action ->
      vorpal.GRBL.immediate.onNext {text: '$x'}
      Promise.resolve()
