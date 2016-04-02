"use strict";

/*
Home the machine, setting up the machine zero.
*/

const  messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("home", "Home the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.do(
        {
          text: "$h\n"
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};
