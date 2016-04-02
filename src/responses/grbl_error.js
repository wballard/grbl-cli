"use strict";
/*
GRBL has reported and error, print it and reset to avoid a crash.
*/

let messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    let last = command.grbl.machine.last;
    if (last) {
      command.vorpal.log(
        messages.error(`${last.file}:${last.line} ${last.text}`),
        messages.error(`\n  ${command.message}`),
        "\n"
      );
    }
    command.grbl.reset();
    resolve(command);
  });
};