"use strict";
/*
Play the contents of a file through to your GRBL.
*/
const Promise = require("bluebird")
  , fsAutocomplete = require("vorpal-autocomplete-fs")
  , gcode = Promise.promisify(require("gcode-parser").parseFile)
  , Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("play <filename...>", "Run all the GCODE in a file")
    .validate(function() {
      if (vorpal.GRBL)
        return true;
      else
        return `You must ${vorpal.chalk.cyan("connect")} first`;
    })
    .autocomplete(fsAutocomplete())
    .action(function(args) {
      return Promise.resolve(args.filename)
        .each(function(filename) {
          return gcode(filename)
            .then(function(commands) {
              vorpal.GRBL.enqueue(
                Rx.Observable.from(commands).map(
                  (command, i) =>
                    Object.assign(command,
                      {
                        file: filename
                        , line: i
                        , text: command.line
                        , action: "send"
                      }
                    )
                )
              );
            });
        });
    });
};