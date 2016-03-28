"use strict";

/*
Resume the current program run.
*/

const messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("resume", "Resume current program run")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.direct(
        {
          text: "~"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
