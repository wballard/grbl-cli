"use strict";

/*
Unlock the machine after an alarm.
*/

const Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("unlock", "Unlock the machine")
    .action(function() {
      vorpal.GRBL.enqueue(
        Rx.Observable.of(
          {
            text: "$x"
            , action: "send"
          }
        ));
      vorpal.GRBL.next();
      return Promise.resolve();
    });
};
