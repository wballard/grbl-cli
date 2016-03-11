"use strict";
/*
GRBL has something to say, so print it.
*/

let messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.vorpal.log(
      messages.ok(command.message)
    );
    resolve(command);
  });
};