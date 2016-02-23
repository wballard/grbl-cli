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

Everything here works on a 'standard action' metaphor, and object like
```
{
  action: 'name'
  ,...
}
```
All additional data is attached to the action.

*/

"use strict";
var Rx = require('rx');
var Promise = require('bluebird');
var chalk = require('chalk');
var serialport = require("serialport");

var errorMessage = chalk.bold.red;
var traceMessage = chalk.blue;

/*
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
*/
module.exports = function(vorpal, connect) {
  let grbl = new serialport.SerialPort(
      `/dev/${connect.port}`
      ,{
        parser: serialport.parsers.readline("\n")
        ,baudrate: connect.options.baudrate
      }
    )

  //bridge out events coming in from the serial connection to GRBL
  let open = Rx.Observable.fromEvent(grbl, 'open')
    .map(function(){
      return {action: 'open'};
    });
  let close = Rx.Observable.fromEvent(grbl, 'close')
    .map(function(){
      return {action: 'close'};
    });
  let data = Rx.Observable.fromEvent(grbl, 'data')
    .map(function(data){
      return {action: 'data', data};
    });
  let error = Rx.Observable.fromEvent(grbl, 'error')
    .map(function(error){
      return {action: 'data', error};
    });
  //bridge to allow injection of immediate commands from the CLI
  let immediate = Rx.Observable.create(function(observer){
    vorpal.immediate = function(command, completion_promise) {
      observer.onNext(command)
    }
  });
  //collect feedback and status on a timer
  let status = Rx.Observable.timer(0, 1000)
    .map(function(){
      return {action: 'status'};
    });
  //listen to everything streaming back and forth from GRBL,
  //this is the unified event stream
  let from_grbl = Rx.Observable.merge(
    open
    ,close
    ,data
    ,error
    ,immediate
    ,status
  )
    //by this point, we have a stream of actions, so run an action dispatch map
    .tap(function(command) {
      vorpal.log(traceMessage(JSON.stringify(command)));
    })
    .do(function(command){
      switch(command.action) {
        case 'disconnect':
          grbl.close();
          break;
        case 'close':
          vorpal.subscription.dispose();
          break;
        case 'status':
          grbl.write('?\n');
          break;
      }
    });
  //and hook up a subscription to get reactive going
  vorpal.subscription = from_grbl.subscribe();
}
