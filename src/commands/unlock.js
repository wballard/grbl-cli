"use strict";

/*
Unlock the machine after an alarm.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("unlock", "Unlock the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
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
