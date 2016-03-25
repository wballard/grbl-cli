"use strict";
/*
Play the contents of a file through to your GRBL.
*/
const Promise = require("bluebird")
  , fsAutocomplete = require("vorpal-autocomplete-fs")
  , gcode = require("gcode")
  , fs = require("fs")
  , byline = require("byline")
  , messages = require("../messages.js")
  , Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("play <filename...>", "Run all the GCODE in a file")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .autocomplete(fsAutocomplete())
    .action(function(args) {
      return Promise.resolve(args.filename)
        .each(function(filename) {
          return new Promise((resolve, reject) => {
            let lines = byline(fs.createReadStream(filename, { encoding: "utf8" }));
            let lineNumber = 1;
            lines.on("data", (line) => {
              gcode.parseString(line, (err, command) => {
                if (err) {
                  vorpal.log(messages.error(err), messages.error(line));
                  lines.close();
                  reject();
                }
                if (command.length) {
                  vorpal.GRBL.enqueue(
                    Rx.Observable.of(
                      {
                        file: filename
                        , line: lineNumber++
                        , text: line
                        , action: "send"
                      }
                    ));
                } else {
                  vorpal.log(messages.info(line));
                }
              });
            });
            lines.on("end", () => {
              vorpal.GRBL.enqueue(
                Rx.Observable.of(
                  {
                    file: filename
                    , line: lineNumber++
                    , text: ""
                    , end: true
                    , action: "send"
                  }
                ));
              resolve();
            });
            lines.on("error", () => {
              reject();
            });

          });
        })
        .then(() => {
          console.error('done');
        });
    });
};