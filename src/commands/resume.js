"use strict";

/*
Resume the current program run.
*/

module.exports = function(vorpal) {
  vorpal
    .command("resume", "Resume current program run")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.GRBL.grblPort.write("~\n");
      }
      return Promise.resolve();
    });
};
