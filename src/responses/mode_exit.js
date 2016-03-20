"use strict";
/*
Leaving direct mode.
*/

module.exports = function(command) {
  command.vorpal.log("..."); 
  command.grbl.direct = false;  
  return Promise.resolve();
};