"use strict";
/*
General warning message.
*/

let messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    if (command.message) {
      command.vorpal.log(
        messages.warn(command.message)
      );
    }
    resolve(command);
  });
};