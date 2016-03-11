"use strict";
/*
Series of animated prompt frames to reflect the running state.
*/

const chalk = require("chalk");
const dotsFrames = ["⣾", "⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽"];
const errorFrames = ["⣿", "⠀"];

let dotat = 0;

module.exports = {
  run: () =>
    chalk.green(dotsFrames[dotat = ++dotat % dotsFrames.length])
  , idle: () =>
    chalk.green("⣿")
  , hold: () =>
    chalk.yellow(errorFrames[dotat = ++dotat % errorFrames.length])
  , alarm: () =>
    chalk.red(errorFrames[dotat = ++dotat % errorFrames.length])
};
