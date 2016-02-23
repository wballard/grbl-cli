/*
Interact with a GRBL device with RxJS.

GRBL can be controlled with multiple inputs:
- GCODE
  - file streaming
  - manually typed
- System Commands
  - `$` commands
  - `~`
  - `!`
  - `?`
  - `ctrl-x` reset

...and provides multiple outputs:
- `ok`
- `error`
- `ALARM`
- `[]` feeback
- `<>` position status

GCODE inputs are  answered with `ok` and `error` responses, queuing up here in
memory. `ok` allows the next command. `error` flushes out all commands and
resets.

You add to the queue by typing in a `gcode` subshell or `play` a file
of gcode commands. Both sources of commands, the sequence of manually typed and
the sequence of file originated, are concat into a single sequence before being
sent along to GRBL.

Files loaded with `play` are aborted on any `error` to help avoid crashes.

System commands are not queued but sent through immediately.


*/

"use strict";
var Rx = require('rx');
var Promise = require('bluebird');
var chalk = require('chalk');

var errorMessage = chalk.bold.red;
var traceMessage = chalk.blue;

/*
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
*/
module.exports = function(vorpal, serialport) {
  let open = Rx.Observable.fromEvent(serialport, 'open');
  let close = Rx.Observable.fromEvent(serialport, 'close');
  let data = Rx.Observable.fromEvent(serialport, 'data');
  let error = Rx.Observable.fromEvent(serialport, 'error');
  //bridge out to allow injection of immediate commands
  let immediate = Rx.Observable.create(function(observer){
    vorpal.immediate = function(command, completion_promise) {
      observer.onNext({command})
    }
  });
  //listen to everything streaming back and forth from GRBL
  let from_grbl = Rx.Observable.merge(
    open
    ,close
    ,data
    ,error
    ,immediate
  );
  vorpal.subscription = from_grbl.subscribe(
    function(ok) { vorpal.log(ok)}
    , function(error) { vorpal.log(errorMessage(error))}
  );
}
