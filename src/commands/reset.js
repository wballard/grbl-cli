"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

module.exports = function(vorpal) {
  vorpal
    .command("reset", "Reset the machine")
    .action(function() {
      vorpal.GRBL.fifo.drain();
      vorpal.GRBL.grblPort.write("\x18");
      return Promise.resolve();
    });
};
