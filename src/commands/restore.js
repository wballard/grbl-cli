"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

module.exports = function(vorpal) {
  vorpal
    .command("restore", "Return all settings to default")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.GRBL.reset();
        vorpal.GRBL.grblPort.write("$RST=*\n");
      }
      return Promise.resolve();
    });
};
