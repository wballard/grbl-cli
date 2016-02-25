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
Promise = require('bluebird')
messages = require('./messages')
status_parser = require('./status_parser.coffee')

###
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
###
class GRBL
  ###
  Construction is about attaching a communication port.
  ###
  constructor: (vorpal, @grblPort) ->
    #bridge out events coming in from the serial connection to grblPort
    open = Rx.Observable.fromEvent(@grblPort, 'open')
      .map -> {action: 'open'}
    close = Rx.Observable.fromEvent(@grblPort, 'close')
      .map -> {action: 'close'}
    data = Rx.Observable.fromEvent(@grblPort, 'data')
      .map (data) -> {action: 'data', data}
    error = Rx.Observable.fromEvent(@grblPort, 'error')
      .map (error) -> {action: 'data', error}
    #collect feedback and status on a timer
    status = Rx.Observable.timer(0, 1000)
      .map -> {action: 'status'}
    @gcode = new Rx.Subject()
    @commands = Rx.Observable.merge(
      @gcode,
      open,
      close,
      data,
      error,
      status
    )
    .tap (command) -> vorpal.log(messages.trace(JSON.stringify(command)))
    .do (command) =>
     #status commands ask GRBL for a report
      if command.action is 'status'
        @grblPort.write '?'
    .map (command) ->
      console.error 'what'
      #turn status reports into structured data
      try
        if command.action is 'data'
          status_parser(command.data)
        else
          command
      catch e
        vorpal.log(messages.error(e))
    .tap (command) -> vorpal.log(messages.trace(JSON.stringify(command)))
    .subscribe()

  ###
  Disconnect the port and any observables.
  ###
  close : ->
    @grblPort.close()
    @commands.dispose()

module.exports = GRBL
