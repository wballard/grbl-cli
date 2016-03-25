"use strict";
const Rx = require("rx")
  , _ = require("lodash")
  , GamePad = require("node-gamepad");


/*
Provide a throttled observable of events off of a gamepad. The rules:
* All actions are enqueued back to grbl
* DPad buttons move X or Y by 0.1mm incrementally
*/
module.exports = function(vorpal, grbl) {
  let ps3Pad = new GamePad("ps3/dualshock3");
  try {
    ps3Pad.connect();
  } catch (e) { }

  const interval = 200;

  return Rx.Observable.merge(
    /*
    Buttons just turn directly into actions.
    */
    Rx.Observable.fromEvent(ps3Pad, "dpadUp:press").map(() => ({ action: "jog", dx: 0, dy: grbl.jog, dz: 0 }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadDown:press").map(() => ({ action: "jog", dx: 0, dy: -1 * grbl.jog, dz: 0 }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadLeft:press").map(() => ({ action: "jog", dx: -1 * grbl.jog, dy: 0, dz: 0 }))
    , Rx.Observable.fromEvent(ps3Pad, "dpadRight:press").map(() => ({ action: "jog", dx: grbl.jog, dy: 0, dz: 0 }))
    , Rx.Observable.fromEvent(ps3Pad, "r1:press").map(() => ({ action: "jog", dx: 0, dy: 0, dz: -1 * grbl.jog }))
    , Rx.Observable.fromEvent(ps3Pad, "l1:press").map(() => ({ action: "jog", dx: 0, dy: 0, dz: grbl.jog }))
    /*
     For the left joystick, control the fast motion. The idea is to buffer up every 200ms, then
     average out the joystick position -- smoothing. From there, the major axis of motion determines
     the implied feed rate -- as a percentage of the maximum feed speed in that axis, with the distance to 
     cover being `interval` time. The minor axis motion is along for the ride, as GRBL will make a 
     single motion anyhow.
     
     The joystick returns 0-255 on both axes, which we need to center on a +/- and then quantize
     with a bit of fuzz so we aren't always moving.
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
            move.x += (sample.x - 127) / moveSamples.length;
            move.y += (sample.y - 127) / moveSamples.length;
            return move;
          }
          , move);
      })
      .map((action) => {
        action.x = (action.x - 127) / 128;
        action.y = -1 * (action.y - 127) / 128;
        return action;
      })
      //this is a high-pass sort of filter so that little bits of noise in the analog controller
      //don't lead to constant motion
      //push the joystick for reals
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
          action.dz = 0;
        } else {
          action.dx = action.x * my;
          action.dy = action.y * my;
          action.dz = 0;
        }
        return action;
      })
    /*
    And -- fast Z jogging on the triggers. This is about moving with a pulse train, where the buttons
    act as filters to control the jogging events making through.
    */
    , Rx.Observable.fromEvent(ps3Pad, "r2:press").do(() => grbl.machine.jog = "down")
    , Rx.Observable.fromEvent(ps3Pad, "l2:press").do(() => grbl.machine.jog = "up")
    , Rx.Observable.fromEvent(ps3Pad, "r2:release").do(() => grbl.machine.jog = undefined)
    , Rx.Observable.fromEvent(ps3Pad, "l2:release").do(() => grbl.machine.jog = undefined)
    , Rx.Observable.timer(0, interval).map(() => {
      let mz = (grbl.machine.settings["112"] || 1000) / 60 * (interval / 1000);
      if (Object.is("up", grbl.machine.jog)) {
        return {
          action: "jog"
          , dx: 0
          , dy: 0
          , dz: mz
        };
      } else if (Object.is("down", grbl.machine.jog)) {
        return {
          action: "jog"
          , dx: 0
          , dy: 0
          , dz: -1 * mz
        };
      }
    })
    //and a home button
    , Rx.Observable.fromEvent(ps3Pad, "psx:press").do(() => {
      vorpal.exec("home");
    })
  )
    .finally(() => {
      ps3Pad.disconnect();
    });
};