"use strict";

/*
Pause the current program run. This will leave the spindle powerered.
*/

module.exports = function(vorpal) {
  vorpal
    .command("pause", "Pause current program run")
    .action(function() {
      vorpal.GRBL.grblPort.write("!");
      return Promise.resolve();
    });
};
