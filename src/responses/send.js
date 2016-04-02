"use strict";
/*
Send text to GRBL.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    if (command.file) {
      command.grbl.machine.last = {
        file: command.file,
        line: command.line,
        text: command.text
      };
    }
    command.grbl.grblPort.write(command.text);
    if (command.afterSend) command.afterSend();
    resolve(command);
  });
};