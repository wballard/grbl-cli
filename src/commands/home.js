"use strict";

/*
Home the machine, setting up the machine zero.
*/

const Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("home", "Home the machine")
    .action(function() {
      vorpal.GRBL.enqueue(
        Rx.Observable.of(
          {
            text: "$g\n$#\n$$"
            , action: "send"
          }
        ));
      vorpal.GRBL.next();
      return Promise.resolve();
    });
};
