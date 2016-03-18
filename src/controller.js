"use strict";
const Rx = require("rx")
  , _ = require("lodash")
  , GamePad = require("node-gamepad");


/*
Provide a throttled observable of events off of a gamepad. The rules:
* All actions are enqueued back to grbl
* DPad buttons move X or Y by 0.1mm incrementally
*/
module.exports = function(grbl) {
  let ps3Pad = new GamePad("ps3/dualshock3");
  ps3Pad.connect();

  const interval = 200;

  return Rx.Observable.merge(
    /*
    Buttons just turn directly into actions.
    */
    Rx.Observable.fromEvent(ps3Pad, "dpadUp:press").map(() => ({ action: "jogup" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadDown:press").map(() => ({ action: "jogdown" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadLeft:press").map(() => ({ action: "jogleft" }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadRight:press").map(() => ({ action: "jogright" }))
    /*
     For the left joystick, control the fast motion. The idea is to buffer up every 200ms, then
     average out the joystick position -- smoothing. From there, the major axis of motion determines
     the implied feed rate -- as a percentage of the maximum feed speed in that axis, with the distance to 
     cover being 200ms of travel. The minor axis motion is along for the ride, as GRBL will make a 
     single motion anyhow.
     
     The joystick returns 0-255 on both axes, which we need to center on a +/- and then quantize
     with a bit of fuzz so we aren't always moving.
     
     And -- figure a feedrate to make 200ms worth of move along the major axis.
    */
    , Rx.Observable.fromEvent(ps3Pad, "left:move")
      .bufferWithTime(interval)
      .map((moveSamples) => {
        let move = {
          action: "jog"
          , x: 127
          , y: 127
          , moveSamples
        };
        return _.reduce(moveSamples
          , (move, sample) => {
            move.x += (sample.x-127) / moveSamples.length;
            move.y += (sample.y-127) / moveSamples.length;
            return move;
          }
          , move);
      })
      .map((action) => {
        action.x = (action.x-127) / 128;
        action.y = -1 * (action.y-127) / 128;
        return action;
      })
      .map((action) => {
        action.x = Math.abs(action.x) > 0.2 ? action.x : 0;
        action.y = Math.abs(action.y) > 0.2 ? action.y : 0;
        return action;
      })
      .filter((action) => {
        return Math.abs(action.x) || Math.abs(action.y);
      })
      .map((action) => {
        let mx = (grbl.machine.settings["110"] || 1000) / 60 * (interval / 1000)
          , my = (grbl.machine.settings["111"] || 1000) / 60 * (interval / 1000);
        if (action.x > action.y) {
          action.dx = action.x * mx;
          action.dy = action.y * mx;
        } else {
          action.dx = action.x * my;
          action.dy = action.y * my;
        }
        return action; 
      })
  )
    .finally(() => {
      ps3Pad.disconnect();
      ps3Pad._usb.close();
    });
};