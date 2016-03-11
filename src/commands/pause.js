"use strict";

/*
Pause the current program run. This will leave the spindle powerered.
*/

module.exports = function(vorpal) {
  vorpal
    .command("pause", "Pause current program run")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.GRBL.grblPort.write("!\n");
      }
      return Promise.resolve();
    });
};
