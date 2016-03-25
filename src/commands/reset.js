"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("reset", "Reset the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.fifo.drain();
      vorpal.GRBL.grblPort.write("\x18");
      return Promise.resolve();
    });
};
