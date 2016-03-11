"use strict";
/*
GRBL has reported and error, print it and reset to avoid a crash.
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