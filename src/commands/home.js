"use strict";

/*
Home the machine, setting up the machine zero.
*/

const Rx = require("rx")
  , messages = require("../messages.js");

module.exports = function(vorpal) {
  vorpal
    .command("home", "Home the machine")
    .validate(function() {
      return messages.connected(vorpal);
    })
    .action(function() {
      vorpal.GRBL.enqueue(
        Rx.Observable.of(
          {
            text: "$h"
            , action: "send"
          }
        ));
      vorpal.GRBL.next();
      return Promise.resolve();
    });
};
