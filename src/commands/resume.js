"use strict";

/*
Resume the current program run.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("resume", "Resume current program run")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.grblPort.write("~");
      return Promise.resolve();
    });
};
