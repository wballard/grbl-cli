"use strict";

/*
Reset the machine. This will stop the world and cut in line, flush out all
buffered commands and generally act just like you booted up.
*/

const messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("restore", "Return all settings to default")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.enqueue(
        {
          text: "$RST=*\n"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
