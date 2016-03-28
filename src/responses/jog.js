"use strict";
/*
Jog the gantry 'up' the Y, these are enqueued motion commands.
*/

const Rx = require("rx");

module.exports = function(command) {
  command.grbl.enqueue(Rx.Observable.of({
    action: "send"
    , text: `G91G0X${command.dx}Y${command.dy}Z${command.dz}\n`
  }));
  return Promise.resolve();
};