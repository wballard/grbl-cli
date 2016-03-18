"use strict";
/*
GRBL has connected and is saying hello. Hello there GRBL!
Ask for initial state, so that we know what is going on.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.grblPort.write("$g\n");
    command.grbl.grblPort.write("$#\n");
    command.grbl.grblPort.write("$$\n");
    command.grbl.next();
    resolve(command);
  });
};