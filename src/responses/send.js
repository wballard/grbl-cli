"use strict";
/*
Ask GRBL for position status.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.grblPort.write(command.text);
    command.grbl.grblPort.write("\n");
    resolve(command);
  });
};