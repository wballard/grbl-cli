"use strict";

/*
Pause the current program run. This will leave the spindle powerered.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("pause", "Pause current program run")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.grblPort.write("!");
      return Promise.resolve();
    });
};
