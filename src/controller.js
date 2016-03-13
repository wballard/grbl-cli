"use strict";
const Rx = require("rx")
  , GamePad = require("node-gamepad");


/*
Provide a throttled observable of events off of a gamepad. The rules:
* All actions are enqueued back to grbl
* DPad buttons move X or Y by 0.1mm incrementally
*/
module.exports = function() {
  let ps3Pad = new GamePad("ps3/dualshock3");
  ps3Pad.connect();

  return Rx.Observable.merge(
    Rx.Observable.fromEvent(ps3Pad, "dpadUp:press").map(() => ({ action: "jogup" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadDown:press").map(() => ({ action: "jogdown" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadLeft:press").map(() => ({ action: "jogleft" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadRight:press").map(() => ({ action: "jogright" }))
  )
    .finally(() => {
      ps3Pad._usb.close();
    });
};