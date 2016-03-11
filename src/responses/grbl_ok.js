"use strict";
/*
GRBL has accepted a command, dispatch the next one.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.next();
    resolve(command);
  });
};