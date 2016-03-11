"use strict";

/*
Home the machine, setting up the machine zero.
*/

module.exports = function(vorpal) {
  vorpal
    .command("home", "Home the machine")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.GRBL.grblPort.write("$h\n");
      }
      return Promise.resolve();
    });
};
