###
Pause the current program run. This will leave the spindle powerered.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'pause', 'Pause current program run'
    .action ->
      vorpal.GRBL.immediate.onNext {text: '!'}
      Promise.resolve()
