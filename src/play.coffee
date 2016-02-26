###
Play the contents of a file through to your GRBL.
###
Promise = require('bluebird')
fsAutocomplete = require('vorpal-autocomplete-fs')
gcode = Promise.promisify(require('gcode-parser').parseFile)
Rx = require('rx')

module.exports = (vorpal, options) ->
  vorpal
    .command 'play <filename...>',
      'Run all the GCODE in a file'
    .validate (args) ->
      if vorpal.GRBL
        return true
      else
        return "You must #{vorpal.chalk.cyan('connect')} first"
    .autocomplete fsAutocomplete()
    .action (args) ->
      Promise.resolve args.filename
        .each (filename) ->
          gcode filename
            .then (commands) ->
              vorpal.GRBL.enqueue Rx.Observable.from(commands).map (command, i) ->
                Object.assign command, {
                  file: filename
                  line: i
                  text: command.line
                }
