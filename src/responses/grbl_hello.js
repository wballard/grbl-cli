"use strict";
/*
GRBL has connected and is saying hello. Hello there GRBL!
Ask for initial state, so that we know what is going on.
*/

const Rx = require("rx");

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.enqueue(
      Rx.Observable.of(
        {
          text: "$g\n$#\n$$"
          , action: "send"
        }
      ));
    command.grbl.next();
    resolve(command);
  });
};