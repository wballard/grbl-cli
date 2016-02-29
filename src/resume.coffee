###
Resume the current program run.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'resume', 'Resume current program run'
    .action ->
      vorpal.GRBL.immediate.onNext {text: '~'}
      Promise.resolve()
