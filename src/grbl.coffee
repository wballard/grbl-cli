###
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
###

Rx = require('rx')
require('./actionpacked.js')
Rx.config.longStackSupport = true
Promise = require('bluebird')
messages = require('./messages')
status_parser = require('./status_parser.coffee')
FIFO = require('./fifo.coffee')
path = require('path')

###
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
###
class GRBL
  ###
  Construction is about attaching a communication serial port.
  ###
  constructor: (vorpal, @grblPort, @machine={}) ->
    #bridge out events coming in from an event source to an observable
    eventAction = (object, name) ->
      Rx.Observable.fromEvent(object, name)
        .map (data) -> {action: name, data}
    #immediate add of a command
    @immediate = new Rx.Subject()
    #fifo for GCODE commands that need parsing
    @fifo = new FIFO()
    #ask for status on a timer
    status = Rx.Observable.timer(0, 500)
      .map -> {action: 'status'}
    #and observe all the commands together
    @commands = Rx.Observable.merge(
      @immediate,
      @fifo.observable,
      eventAction(@grblPort, 'open'),
      eventAction(@grblPort, 'close'),
      eventAction(@grblPort, 'error'),
      eventAction(@grblPort, 'data'),
      status
    )
    #Here is a chance to parse any data coming in from GRBL and turn it to
    #a structured object instead of just a string
    .map (command) =>
      if command.action is 'data'
        status_parser(command.data)
      else
        command
    #reduce down to a new state, merging in updates, this is effectively
    #a one way, immutable react style flow
    .do (command) =>
      @machine = Object.assign(@machine, command)
      command.grbl = @
      command.vorpal = vorpal
    .actionPacked(path.join(__dirname, "responses"))
    #gets the whole observable going, with message printing
    .subscribe @j, (e) =>
      vorpal.log e.toString()
    , @close

  ###
  Disconnect the serial and any observables.
  ###
  close : =>
    @grblPort.close()
    @commands.dispose()
  
  next: ->
    @fifo.next()

  reset: ->
    @fifo.drain()
    
  enqueue: (thing) ->
    @fifo.enqueue thing

module.exports = GRBL
