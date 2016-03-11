"use strict";

/*
Disconnection command, unhooks from your GRBL.

If you are connected, and connect to a different port, you will
be disconnected automatically. -- one port at a time!

If you need to have multiple GRBL connections run grbl-cli multiple times
in different shells.
*/


module.exports = function(vorpal) {
  vorpal
    .command("disconnect", "Disconnect from your GRBL device")
    .action(function() {
      if (vorpal.GRBL) {
        vorpal.ui.delimiter("grbl>");
        vorpal.GRBL.close();
        delete vorpal.GRBL;
      }
      return Promise.resolve();
    });
};
