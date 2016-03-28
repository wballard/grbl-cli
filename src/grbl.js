"use strict";
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

const Rx = require("rx")
  , status_parser = require("./status_parser.js")
  , FIFO = require("./fifo.js")
  , path = require("path")
  , prompts = require("./prompts.js")
  , controller = require("./controller.js");

Rx.config.longStackSupport = true;
require("./actionpacked.js");

module.exports = class GRBL {
  /*
  Construction is about attaching a communication serial port.
  */
  constructor(vorpal, grblPort) {
    let grbl = this;
    this.grblPort = grblPort;
    this.machine = {
      state: {}
      , settings: {}
    };
    this.jog = 0.1;
    this.vorpal = vorpal;
    //bridge out events coming in from an event source to an observable
    let eventAction = (object, name) => {
      return Rx.Observable
        .fromEvent(object, name)
        .map((data) => {
          return { action: name, data };
        });
    };
    //fifo for GCODE commands that need to be throttled
    this.fifo = new FIFO();
    //direct command processing, no queue
    this.direct = new Rx.Subject();
    //ask for status on a timer, 5Hz
    let status = Rx.Observable.timer(0, 200)
      .map(() => {
        return { action: "status" };
      });
    //and observe all the commands together
    this.commands = Rx.Observable.merge(
      this.fifo.observable
      , this.direct
      , eventAction(grblPort, "open")
      , eventAction(grblPort, "close")
      , eventAction(grblPort, "error")
      , eventAction(grblPort, "data")
      , eventAction(vorpal, "mode_enter")
      , eventAction(vorpal, "mode_exit")
      , status
      , controller(vorpal, this)
    )
      //Here is a chance to parse any data coming in from GRBL and turn it to
      //a structured object instead of just a string
      .map((command) => {
        if (command && Object.is("data", command.action)) {
          return status_parser(command.data);
        } else {
          return command;
        }
      })
      .do((command) => {
        if (command) {
          command.grbl = grbl;
          command.vorpal = vorpal;
        }
      })
      .actionPacked(path.join(__dirname, "responses"))
      //gets the whole observable going, with message printing
      .subscribe(
      () => {
        const
          m = grbl.machine.state.machine_position
          , w = grbl.machine.state.work_position;
        let ret = "";
        let pfn = prompts[grbl.machine.state.status];
        if (pfn)
          ret += `${pfn()} `;
        if (m)
          ret += `m:(${m.x},${m.y},${m.z}) w:(${w.x},${w.y},${w.z}) grbl>`;
        else
          ret += "grbl>";
        if (grbl.direct)
          ret += " direct>";
        vorpal.ui.delimiter(ret);
      }
      , (e) => {
        if (e) vorpal.log(e.toString());
      }
      , this.close
      );

  }

  /*
  Disconnect the serial and any observables.
  */
  close() {
    this.grblPort.close();
    this.commands.dispose();
  }

  /*
  Pump along the FIFO queue to run the next available command
  streaming to GRBL with the send / ok response protocol.
  */
  next() {
    this.fifo.next();
  }

  /*
  OH NOES! Throw away all queued commands, we have hit a bad error. 
  */
  reset() {
    this.vorpal.exec("reset");
  }

  /*
  Put a command in queue to send to GRBL, this follows the send / ok response
  protocol. Smart enough to figure if you just sent in an action, it wraps in an
  observable if you do.
  */
  enqueue(thing) {
    if (thing.action)
      this.fifo.enqueue((Rx.Observable.of(thing)));
    else
      this.fifo.enqueue(thing);
  }

  /*
  Directly run a command, no queueing.
  */
  do(thing) {
    this.direct.onNext((Rx.Observable.of(thing)));
  }

};
