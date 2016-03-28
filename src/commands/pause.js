"use strict";

/*
Pause the current program run. This will leave the spindle powerered.
*/

const messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("pause", "Pause current program run")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.direct(
        {
          text: "!"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
