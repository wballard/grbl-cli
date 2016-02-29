###
Home the machine, setting up the machine zero.
###
Promise = require('bluebird')

module.exports = (vorpal, options) ->
  vorpal
    .command 'home', 'Home the machine'
    .action ->
      vorpal.GRBL.immediate.onNext {text: '$h'}
      Promise.resolve()
