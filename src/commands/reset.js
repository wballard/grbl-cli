"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

const messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("reset", "Reset the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.fifo.drain();
      vorpal.GRBL.do(
        {
          text: "\x18"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
