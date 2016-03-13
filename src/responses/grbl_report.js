"use strict";
/*
GRBL has something to say, so print it.
*/

const prompts = require("../prompts.js");

module.exports = function(command) {
  return new Promise(function(resolve) {
    const 
      m = command.state.machine_position
      ,w = command.state.work_position;
    let ret = "";
    let pfn = prompts[command.state.status];
    if(pfn)
      ret += `${pfn()} `;
    if(m)
      ret += `m:(${m.x},${m.y},${m.z}) w:(${w.x},${w.y},${w.z}) grbl>`;
    else
      ret += "grbl>";
    if(command.grbl.direct)
      ret += " direct>";
    command.vorpal.ui.delimiter(ret);
    Object.assign(command.grbl.machine.state, command.state);
    resolve(command);
  });
};