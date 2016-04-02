"use strict";

/*
Unlock the machine after an alarm.
*/

const messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("unlock", "Unlock the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.do(
        {
          text: "$x\n"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
