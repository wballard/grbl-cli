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
          return new Promise((resolve) => {
            let lines = byline(fs.createReadStream(filename, { encoding: "utf8" }));
            let lineNumber = 1;
            let parse = Rx.Observable.fromNodeCallback(gcode.parseString);

            //turn lines of data into parsed command objects ready to send
            let data = Rx.Observable
              .fromEvent(lines, "data")
              .where((line) => line.length)
              .selectMany((line) => {
                return parse(line);
              })
              .map((command) => {
                if (command.length) {
                  //a full command to send along to grbl
                  return {
                    file: filename
                    , line: lineNumber++
                    , text: `${command.source}\n`
                    , action: "send"
                    , afterSend: () => vorpal.log(messages.info(command.source))
                    , parsedCode: command
                  };
                } else {
                  //just an instream logging, no sending
                  return {
                    file: filename
                    , line: lineNumber++
                    , text: `${command.source}`
                    , action: "continue"
                  };
                }
              });

            //at the end of the gcode stream, pop in a marker 'end'
            let end = Rx.Observable.fromEvent(lines, "end")
              .map(() => {
                return {
                  file: filename
                  , line: lineNumber++
                  , text: ""
                  , end: true
                  , action: "send"
                };
              });
            vorpal.GRBL.enqueue(Rx.Observable.merge(data, end));
            resolve();

          });
          //each
        });
      //action
    });
};