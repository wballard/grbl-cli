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
var messages = require('./messages');

/*
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
*/
class GRBL {
  /*
  Construction is about attaching a communication port.
  */
  constructor(vorpal, grblPort){
    this.grblPort = grblPort;
    //bridge out events coming in from the serial connection to grblPort
    let open = Rx.Observable.fromEvent(grblPort, 'open')
      .map(function(){
        return {action: 'open'};
      });
    let close = Rx.Observable.fromEvent(grblPort, 'close')
      .map(function(){
        return {action: 'close'};
      });
    let data = Rx.Observable.fromEvent(grblPort, 'data')
      .map(function(data){
        return {action: 'data', data};
      });
    let error = Rx.Observable.fromEvent(grblPort, 'error')
      .map(function(error){
        return {action: 'data', error};
      });
    //collect feedback and status on a timer
    let status = Rx.Observable.timer(0, 1000)
      .map(function(){
        return {action: 'status'};
      });
    this.gcode = new Rx.Subject();
    this.commands =  Rx.Observable.merge(
        this.gcode
        ,open
        ,close
        ,data
        ,error
        ,status
      )
        //by this point, we have a stream of actions, so run an action dispatch map
        .tap(function(command) {
          vorpal.log(messages.trace(JSON.stringify(command)));
        })
        .publish()
        .connect();
  }

  /*
  Disconnect the port and any observables.
  */
  close(){
    this.grblPort.close();
    this.commands.dispose();
  }
}
module.exports = GRBL;
