"use strict";
/*
GRBL has connected and is saying hello. Hello there GRBL!
Ask for initial state, so that we know what is going on.
*/

let messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.vorpal.log(
      messages.error(`${command.grbl.machine.file}:${command.grbl.machine.line}`),
      messages.error(command.grbl.machine.text),
      messages.error("\n  #{command.message}")
    );
    command.grbl.reset();
    resolve(command);
  });
};