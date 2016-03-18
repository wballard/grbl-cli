"use strict";
/*
GRBL has something to say, so print it.
*/

let messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.vorpal.log(
        messages.ok(`$${command.setting}=${command.value} ${command.description}`)
      );
    command.grbl.machine.settings[command.setting] = command.value;
    resolve(command);
  });
};