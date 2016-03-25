"use strict";
/*
Message formatting macros.
*/
var chalk = require("chalk");

module.exports = {
  error: chalk.bold.red
  , warn: chalk.bold.yellow
  , ok: chalk.green
  , info: chalk.green
  , trace: chalk.blue
  , connected: (vorpal) => {
    if (vorpal.GRBL)
      return true;
    else
      return `You must ${vorpal.chalk.cyan("connect")} first`;
  }
  , disconnect: (vorpal) => {
    if (!vorpal.GRBL)
      return true;
    else
      return `You must ${vorpal.chalk.cyan("disconnect")} first`;
  }
};