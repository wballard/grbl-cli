"use strict";
/*
Do not send text to GRBL, just log an continue queue processing
*/

const messages = require("../messages.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.machine.last = {
      file: command.file,
      line: command.line,
      text: command.text
    };
    command.grbl.vorpal.log(messages.info(command.text));
    command.grbl.fifo.next();
    resolve(command);
  });
};