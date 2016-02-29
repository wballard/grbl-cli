###
Toggle verbose tracing.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'trace', 'Toggle tracing'
    .action ->
      vorpal.GRBL.immediate.onNext {action: 'tracing'}
      Promise.resolve()
