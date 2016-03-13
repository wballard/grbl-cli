"use strict";
/*
REPL for direct GCODE entry. Pop into this mode and start typing raw
GCODE commands to enqueue to your GRBL.
*/

const Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .mode("direct")
    .description("Direct GRBL input mode")
    .init(() => {
      vorpal.log("Type exit to quit");
      vorpal.emit("mode_enter", "direct");
      return Promise.resolve();
    })
    .action(function(command) {
      vorpal.GRBL.enqueue(Rx.Observable.of({
        action: "send"
        , text: command
      }));
      return Promise.resolve();
    });
};
