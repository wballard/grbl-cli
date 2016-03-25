"use strict";
/*
REPL for direct GCODE entry. Pop into this mode and start typing raw
GCODE commands to enqueue to your GRBL.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .mode("direct")
    .description("Direct GRBL input mode")
    .init(() => {
      vorpal.log("Type exit to quit");
      vorpal.emit("mode_enter", "direct");
      return Promise.resolve();
    })
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function(command) {
      vorpal.GRBL.enqueue(Rx.Observable.of({
        action: "send"
        , text: command
      }));
      vorpal.GRBL.next();
      return Promise.resolve();
    });
};
