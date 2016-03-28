"use strict";
/*
Send text to GRBL.
*/

module.exports = function(command) {
  return new Promise(function(resolve) {
    command.grbl.machine.last = {
      file: command.file,
      line: command.line,
      text: command.text
    };
    command.grbl.grblPort.write(command.text);
    command.vorpal.log(command.text);
    resolve(command);
  });
};