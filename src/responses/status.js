"use strict";
/*
Ask GRBL for position status.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.do(
      {
        text: "?"
        , action: "send"
      }
    );
    resolve(command);
  });
};