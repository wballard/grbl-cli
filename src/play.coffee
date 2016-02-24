###
Play the contents of a file through to your GRBL.
###
Promise = require('bluebird')
fsAutocomplete = require('vorpal-autocomplete-fs')
gcode = Promise.promisify(require('gcode').parseFile)
Rx = require('rx')

module.exports = (vorpal, options) ->
  vorpal
    .command 'play <filename>',
      'Run all the GCODE in a file'
    .autocomplete fsAutocomplete()
    .action (args) ->
      gcode args.filename
        .then (commands) ->
          vorpal.gcode.onNext(Rx.Observable.from(commands))
