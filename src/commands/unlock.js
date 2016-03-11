"use strict";

/*
Unlock the machine after an alarm.
*/

module.exports = function(vorpal) {
  vorpal
    .command("unlock", "Unlock the machine")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.GRBL.grblPort.write("$x\n");
      }
      return Promise.resolve();
    });
};
