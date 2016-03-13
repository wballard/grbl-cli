"use strict";

/*
Set configurable machine properties, or with no arguments, list.
*/

module.exports = function(vorpal) {
  vorpal
    .command("set [register] [value]", "Set GRBL parameter registers")
    .action(function(args) {
      if (vorpal.GRBL) {
        args.register = `${args.register}`;
        if (args.register && args.value) {
          if(!args.register.startsWith("$"))
            args.register = `$${args.register}`;
          vorpal.GRBL.grblPort.write(`${args.register}=${args.value}\n`);
        } else {
          vorpal.GRBL.grblPort.write("$$\n");
        }
      }
      return Promise.resolve();
    });
};
