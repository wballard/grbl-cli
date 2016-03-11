"use strict";
/*
Message formatting macros.
*/
var chalk = require("chalk");

module.exports = {
  error: chalk.bold.red
  ,ok: chalk.green
  ,trace: chalk.blue
};