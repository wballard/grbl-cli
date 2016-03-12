"use strict";

/*
Parse status messages back from GRBL using a parsing expression grammar.
This returns a nice structured pellet of data we can use to display the current
machine status and position in the UI.
*/

const pegjs = require("pegjs")
  , fs = require("fs")
  , path = require("path");

const parser = pegjs.buildParser(
  fs.readFileSync(path.join(__dirname, "status_parser.pegjs"), "utf8")
);

module.exports = function(string) {
  try {
    if (string && string.trim().length)
      return parser.parse(string.trim());
    else
      return {};
  } catch (e) {
    return {
      action: "warn",
      message: string
    };
  }
};
