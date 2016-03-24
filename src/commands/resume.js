"use strict";

/*
Resume the current program run.
*/

module.exports = function(vorpal) {
  vorpal
    .command("resume", "Resume current program run")
    .action(function() {
      vorpal.GRBL.grblPort.write("~");
      return Promise.resolve();
    });
};
