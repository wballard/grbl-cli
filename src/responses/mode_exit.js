"use strict";
/*
Leaving direct mode.
*/

module.exports = function(command) {
  command.grbl.direct = false;  
  return Promise.resolve();
};