"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

const Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("restore", "Return all settings to default")
    .action(function() {
      vorpal.GRBL.enqueue(
        Rx.Observable.of(
          {
            text: "$RST=*"
            , action: "send"
          }
        ));
      vorpal.GRBL.grbl.next();
      return Promise.resolve();
    });
};
