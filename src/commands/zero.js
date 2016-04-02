"use strict";
/*
Set zero, or an offset for a work coordinate system.
*/
const _ = require("lodash");
const work_systems = {
  "G54": "P1",
  "G55": "P2",
  "G56": "P3",
  "G57": "P4",
  "G58": "P5",
  "G59": "P6"
};

const axes = ["X", "Y", "Z"];

module.exports = function(vorpal) {
  vorpal
    .command("zero <work_coordinate_system> <axis> [offset]", "Set zero with an optional offset.")
    .validate(function(args) {
      if (_.keys(work_systems).indexOf(args.work_coordinate_system.toUpperCase()) == -1)
        return `You must pick a work coordinate system in ${_.keys(work_systems)}.`;
      if (axes.indexOf(args.axis.toUpperCase()) == -1)
        return `You must pick an axis in ${axes}.`;
      return true;
    })
    .action(function(args) {
      vorpal.GRBL.do(
        {
          text: `G10${work_systems[args.work_coordinate_system.toUpperCase()]}L20${args.axis}${args.offset || 0}\n`
          , action: "send"
        }
      );
      return Promise.resolve();
    });
};