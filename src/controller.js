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
  /*
   For the left joystick, control the fast motion. The idea is to buffer up every 200ms, then
   average out the joystick position -- smoothing. From there, the major axis of motion determines
   the feed rate -- as a percentage of the maximum feed speed in that axis, with the distance to 
   cover being 200ms of travel. The minor axis motion is along for the ride, as GRBL will make a 
   single motion anyhow.
  */
    .finally(() => {
      ps3Pad._usb.close();
    });
};