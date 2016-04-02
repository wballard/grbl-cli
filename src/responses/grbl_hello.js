"use strict";
/*
GRBL has connected and is saying hello. Hello there GRBL!
Ask for initial state, so that we know what is going on.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.do(
      {
        text: "$g\n"
        , action: "send"
      }
    );
    command.grbl.do(
      {
        text: "$#\n"
        , action: "send"
      }
    );
    command.grbl.do(
      {
        text: "$$\n"
        , action: "send"
      }
    );
    resolve(command);
  });
};