 "use strict";

/*
Everything we know about the machine, defaults printing out as JSON.
*/


module.exports = function(vorpal) {
  vorpal
    .command("status", "Current machine status")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.ui.log(JSON.stringify(vorpal.GRBL.machine, null, 2));
      }
      return Promise.resolve();
    });
};
