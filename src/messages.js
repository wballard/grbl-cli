"use strict";
/*
Message formatting macros.
*/
var chalk = require("chalk");

module.exports = {
  error: chalk.bold.red
  ,warn: chalk.bold.yellow
  ,ok: chalk.green
  ,info: chalk.green
  ,trace: chalk.blue
};