"use strict";

/*
Set configurable machine properties, or with no arguments, list.
*/

const Rx = require("rx");

module.exports = function(vorpal) {
  vorpal
    .command("set [register] [value]", "Set GRBL parameter registers")
    .action(function(args) {
      args.register = `${args.register}`;
      let text = "";
      if (args.register && args.value) {
        if (!args.register.startsWith("$"))
          args.register = `$${args.register}`;
        text = `${args.register}=${args.value}`;

      } else {
        text = "$$";
      }
      vorpal.GRBL.enqueue(
        Rx.Observable.of(
          {
            text: text
            , action: "send"
          }
        ));
      vorpal.GRBL.next();
      return Promise.resolve();
    });
};
