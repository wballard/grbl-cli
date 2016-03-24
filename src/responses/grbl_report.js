"use strict";
/*
GRBL has something to say, so print it.
*/

module.exports = function(command) {
  return Promise.resolve(Object.assign(command.grbl.machine.state, command.state));
};