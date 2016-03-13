"use strict";
/*
Going direct mode.
*/

module.exports = function(command) {
  command.grbl.direct = true;  
  return Promise.resolve();
};